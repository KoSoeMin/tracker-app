import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import type { Category } from '@expense-tracker/shared';

type NewCategory = Pick<Category, 'name' | 'type' | 'icon' | 'color'>;

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...categoryKeys.lists(), filters] as const,
};

export function useCategories() {
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!userId,
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useMutation({
    mutationFn: async (category: NewCategory) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...category, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
