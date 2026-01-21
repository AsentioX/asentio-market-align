import { useState } from 'react';
import { 
  useScheduleItems, 
  useCreateScheduleItem, 
  useUpdateScheduleItem, 
  useDeleteScheduleItem,
  ScheduleItem,
  SCHEDULE_ROLES,
  ScheduleRole,
  EVENT_DATES
} from '@/hooks/useSchedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

const ICON_OPTIONS = [
  'calendar', 'clipboard-check', 'graduation-cap', 'sparkles', 'utensils',
  'megaphone', 'users', 'coffee', 'hard-drive', 'code', 'handshake',
  'gamepad-2', 'pencil', 'trophy', 'party-popper', 'award', 'presentation'
];

interface ScheduleFormData {
  title: string;
  start_time: string;
  end_time: string;
  event_date: string;
  location: string;
  description: string;
  allowed_roles: ScheduleRole[];
  icon_name: string;
}

const defaultFormData: ScheduleFormData = {
  title: '',
  start_time: '',
  end_time: '',
  event_date: EVENT_DATES[0].value,
  location: '',
  description: '',
  allowed_roles: [],
  icon_name: 'calendar',
};

const ScheduleAdmin = () => {
  const { data: items, isLoading } = useScheduleItems();
  const createMutation = useCreateScheduleItem();
  const updateMutation = useUpdateScheduleItem();
  const deleteMutation = useDeleteScheduleItem();
  const { toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData(defaultFormData);
    setFormOpen(true);
  };

  const openEditForm = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      start_time: item.start_time,
      end_time: item.end_time || '',
      event_date: item.event_date,
      location: item.location || '',
      description: item.description || '',
      allowed_roles: item.allowed_roles,
      icon_name: item.icon_name || 'calendar',
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (item: ScheduleItem) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          ...formData,
          end_time: formData.end_time || null,
          location: formData.location || null,
          description: formData.description || null,
        });
        toast({ title: 'Event updated successfully' });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          end_time: formData.end_time || null,
          location: formData.location || null,
          description: formData.description || null,
        });
        toast({ title: 'Event created successfully' });
      }
      setFormOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to save event. Make sure you are logged in as admin.',
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      toast({ title: 'Event deleted successfully' });
      setDeleteOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete event',
        variant: 'destructive' 
      });
    }
  };

  const toggleRole = (role: ScheduleRole) => {
    setFormData(prev => ({
      ...prev,
      allowed_roles: prev.allowed_roles.includes(role)
        ? prev.allowed_roles.filter(r => r !== role)
        : [...prev.allowed_roles, role]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule Admin</h2>
        <Button onClick={openCreateForm} className="bg-cyan-500 hover:bg-cyan-600 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800/50">
              <TableHead className="text-gray-400">Title</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Time</TableHead>
              <TableHead className="text-gray-400">Location</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id} className="border-gray-700 hover:bg-gray-800/50">
                <TableCell className="text-white font-medium">{item.title}</TableCell>
                <TableCell className="text-gray-300">{item.event_date}</TableCell>
                <TableCell className="text-gray-300">
                  {item.start_time}{item.end_time && ` - ${item.end_time}`}
                </TableCell>
                <TableCell className="text-gray-300">{item.location || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditForm(item)}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteConfirm(item)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingItem ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date *</label>
                <Select 
                  value={formData.event_date} 
                  onValueChange={(v) => setFormData({ ...formData, event_date: v })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {EVENT_DATES.map((date) => (
                      <SelectItem key={date.value} value={date.value} className="text-white">
                        {date.label} ({date.day})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Icon</label>
                <Select 
                  value={formData.icon_name} 
                  onValueChange={(v) => setFormData({ ...formData, icon_name: v })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon} className="text-white">
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Start Time *</label>
                <Input
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  placeholder="e.g., 9:00 AM"
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">End Time</label>
                <Input
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  placeholder="e.g., 5:00 PM"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 mb-2 block">Allowed Roles *</label>
                <div className="flex flex-wrap gap-3">
                  {SCHEDULE_ROLES.map((role) => (
                    <label 
                      key={role.value} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.allowed_roles.includes(role.value)}
                        onCheckedChange={() => toggleRole(role.value)}
                        className="border-gray-600 data-[state=checked]:bg-cyan-500"
                      />
                      <span className="text-white">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setFormOpen(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScheduleAdmin;
