import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, FileText, MousePointerClick, ClipboardCheck, AlertTriangle, EyeOff } from 'lucide-react';
import { fetchAllProducts, fetchAssessmentsAdmin, fetchClicksAdmin } from '../../lib/api';

export default function CKAdminDashboard() {
  const [stats, setStats] = useState({
    products: 0, published: 0, missingAffiliate: 0, unpublished: 0,
    assessments: 0, clicks: 0,
  });

  useEffect(() => {
    document.title = 'Admin · Smart Care Kits';
    (async () => {
      const [products, assessments, clicks] = await Promise.all([
        fetchAllProducts(), fetchAssessmentsAdmin(), fetchClicksAdmin(),
      ]);
      setStats({
        products: products.length,
        published: products.filter(p => p.is_published).length,
        missingAffiliate: products.filter(p => !p.affiliate_url).length,
        unpublished: products.filter(p => !p.is_published).length,
        assessments: assessments.length,
        clicks: clicks.length,
      });
    })();
  }, []);

  const cards = [
    { label: 'Products', v: stats.products, icon: <Package className="w-5 h-5" />, to: '/labs/carekits/admin/products' },
    { label: 'Published', v: stats.published, icon: <FileText className="w-5 h-5" />, to: '/labs/carekits/admin/products' },
    { label: 'Assessments completed', v: stats.assessments, icon: <ClipboardCheck className="w-5 h-5" />, to: '/labs/carekits/admin/assessments' },
    { label: 'Affiliate clicks', v: stats.clicks, icon: <MousePointerClick className="w-5 h-5" />, to: '/labs/carekits/admin/analytics' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2 text-stone-500 text-sm">{c.icon}{c.label}</div>
            <p className="text-3xl font-semibold mt-2">{c.v}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Link to="/labs/carekits/admin/products" className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 hover:border-amber-400">
          <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">{stats.missingAffiliate} products missing an affiliate link</p>
            <p className="text-sm text-amber-900/80">These can't drive revenue. Add links to publish.</p>
          </div>
        </Link>
        <Link to="/labs/carekits/admin/products" className="bg-stone-100 border border-stone-200 rounded-2xl p-5 flex items-start gap-3 hover:border-stone-400">
          <EyeOff className="w-5 h-5 text-stone-600 mt-0.5" />
          <div>
            <p className="font-semibold text-stone-900">{stats.unpublished} unpublished products</p>
            <p className="text-sm text-stone-600">Drafts and hidden products.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
