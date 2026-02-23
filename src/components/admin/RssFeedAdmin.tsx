import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Rss } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RssFeed {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  created_at: string;
}

const useRssFeeds = () => {
  return useQuery({
    queryKey: ['rss-feeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as RssFeed[];
    },
  });
};

const RssFeedAdmin = () => {
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const { data: feeds, isLoading } = useRssFeeds();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addFeed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('rss_feeds')
        .insert({ name: newName.trim(), url: newUrl.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      setNewName('');
      setNewUrl('');
      toast({ title: 'Feed Added', description: 'RSS feed has been added successfully.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const toggleFeed = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('rss_feeds')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteFeed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
      toast({ title: 'Feed Deleted', description: 'RSS feed has been removed.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    addFeed.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rss className="w-5 h-5" />
          RSS News Feeds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new feed form */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Feed name (e.g. Road to VR)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="sm:w-48"
          />
          <Input
            placeholder="Feed URL (e.g. https://example.com/feed/)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
            type="url"
          />
          <Button
            type="submit"
            disabled={!newName.trim() || !newUrl.trim() || addFeed.isPending}
            className="bg-asentio-blue hover:bg-asentio-blue/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Feed
          </Button>
        </form>

        {/* Feed list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-asentio-blue" />
          </div>
        ) : feeds && feeds.length > 0 ? (
          <div className="space-y-3">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background"
              >
                <Switch
                  checked={feed.is_active}
                  onCheckedChange={(checked) =>
                    toggleFeed.mutate({ id: feed.id, is_active: checked })
                  }
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{feed.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{feed.url}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Feed</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove "{feed.name}" from the news carousel?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteFeed.mutate(feed.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No RSS feeds configured</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RssFeedAdmin;
