import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Restaurant, useUpdateRestaurant } from '@/hooks/useRestaurants';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EditRestaurantDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRestaurantDialog({ restaurant, open, onOpenChange }: EditRestaurantDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });
  const updateRestaurant = useUpdateRestaurant();
  const { toast } = useToast();

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        domain: restaurant.domain || '',
        contact_email: restaurant.contact_email || '',
        contact_phone: restaurant.contact_phone || '',
        notes: restaurant.notes || '',
      });
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) return;

    if (!formData.name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Restaurant name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateRestaurant.mutateAsync({
        id: restaurant.id,
        updates: {
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          contact_phone: formData.contact_phone.trim() || null,
          notes: formData.notes.trim() || null,
        },
      });
      toast({
        title: 'Restaurant updated',
        description: `${formData.name} has been updated successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update restaurant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Restaurant Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter restaurant name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-domain">Domain</Label>
            <Input
              id="edit-domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Contact Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Contact Phone</Label>
              <Input
                id="edit-phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRestaurant.isPending}>
              {updateRestaurant.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
