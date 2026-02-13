import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { XRProduct } from '@/hooks/useXRProducts';

interface ProductGraphViewProps {
  products: XRProduct[];
}

type AxisKey = 'price' | 'category_count' | 'ai_integration' | 'shipping_status' | 'region_count';

interface AxisOption {
  value: AxisKey;
  label: string;
}

const axisOptions: AxisOption[] = [
  { value: 'price', label: 'Price ($)' },
  { value: 'category_count', label: 'Products per Category' },
  { value: 'ai_integration', label: 'AI Integration' },
  { value: 'shipping_status', label: 'Shipping Status' },
  { value: 'region_count', label: 'Products per Region' },
];

const parsePrice = (p: string | null): number | null => {
  if (!p) return null;
  const match = p.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

const encodeCategory = (val: string, map: Map<string, number>): number => {
  if (!map.has(val)) map.set(val, map.size);
  return map.get(val)!;
};

const ProductGraphView = ({ products }: ProductGraphViewProps) => {
  const [xAxis, setXAxis] = useState<AxisKey>('price');
  const [yAxis, setYAxis] = useState<AxisKey>('category_count');

  const chartData = useMemo(() => {
    const categoryCountMap = new Map<string, number>();
    const regionCountMap = new Map<string, number>();

    products.forEach((p) => {
      categoryCountMap.set(p.category, (categoryCountMap.get(p.category) || 0) + 1);
      regionCountMap.set(p.region, (regionCountMap.get(p.region) || 0) + 1);
    });

    const statusMap = new Map<string, number>();
    const aiMap = new Map<string, number>();

    const getValue = (product: XRProduct, key: AxisKey): number | null => {
      switch (key) {
        case 'price':
          return parsePrice(product.price_range);
        case 'category_count':
          return categoryCountMap.get(product.category) || 0;
        case 'ai_integration':
          return encodeCategory(product.ai_integration, aiMap);
        case 'shipping_status':
          return encodeCategory(product.shipping_status, statusMap);
        case 'region_count':
          return regionCountMap.get(product.region) || 0;
        default:
          return null;
      }
    };

    return products
      .map((p) => {
        const x = getValue(p, xAxis);
        const y = getValue(p, yAxis);
        if (x === null || y === null) return null;
        return { x, y, name: p.name, company: p.company, image_url: p.image_url, z: 60 };
      })
      .filter(Boolean) as { x: number; y: number; name: string; company: string; image_url: string | null; z: number }[];
  }, [products, xAxis, yAxis]);

  const getLabel = (key: AxisKey) => axisOptions.find((o) => o.value === key)?.label || key;

  const getCategoryLabels = (key: AxisKey): Map<number, string> | null => {
    if (key !== 'ai_integration' && key !== 'shipping_status') return null;
    const map = new Map<string, number>();
    products.forEach((p) => {
      const val = key === 'ai_integration' ? p.ai_integration : p.shipping_status;
      encodeCategory(val, map);
    });
    const inverse = new Map<number, string>();
    map.forEach((v, k) => inverse.set(v, k));
    return inverse;
  };

  const xLabels = getCategoryLabels(xAxis);
  const yLabels = getCategoryLabels(yAxis);

  return (
    <div className="space-y-6">
      {/* Axis selectors */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">X Axis:</span>
          <Select value={xAxis} onValueChange={(v) => setXAxis(v as AxisKey)}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg">
              {axisOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Y Axis:</span>
          <Select value={yAxis} onValueChange={(v) => setYAxis(v as AxisKey)}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg">
              {axisOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No plottable data for this axis combination.</p>
          <p className="text-sm mt-1">Try selecting different axes or ensure products have the relevant data.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg p-4">
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                type="number"
                dataKey="x"
                name={getLabel(xAxis)}
                tickFormatter={(val) => xLabels?.get(val) ?? String(val)}
                label={{ value: getLabel(xAxis), position: 'bottom', offset: 20, className: 'fill-muted-foreground text-xs' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={getLabel(yAxis)}
                tickFormatter={(val) => yLabels?.get(val) ?? String(val)}
                label={{ value: getLabel(yAxis), angle: -90, position: 'insideLeft', offset: -5, className: 'fill-muted-foreground text-xs' }}
              />
              <ZAxis dataKey="z" range={[40, 80]} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm max-w-[240px]">
                      {d.image_url && (
                        <img src={d.image_url} alt={d.name} className="w-full h-24 object-cover rounded-md mb-2" />
                      )}
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-muted-foreground text-xs">{d.company}</p>
                      <div className="mt-1 text-xs space-y-0.5">
                        <p>{getLabel(xAxis)}: {xLabels?.get(d.x) ?? d.x}</p>
                        <p>{getLabel(yAxis)}: {yLabels?.get(d.y) ?? d.y}</p>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={chartData} fill="hsl(var(--primary))" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProductGraphView;
