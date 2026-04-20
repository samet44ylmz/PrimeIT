import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  createdAt: string;
  isActive: boolean;
  questionsJson?: string;
}

const fetchAllJobs = async (): Promise<Job[]> => {
  const { data } = await axios.get<Job[]>('/api/jobs/GetAll');
  return data;
};

const fetchJobs = async (searchQuery: string): Promise<Job[]> => {
  if (!searchQuery) return [];
  const { data } = await axios.get<Job[]>(`/api/jobs/Search`, {
    params: { q: searchQuery }
  });
  return data;
};

export const useAllJobs = () => {
  return useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: fetchAllJobs,
    staleTime: 30 * 1000,
  });
};

export const useSearchJobs = (searchQuery: string) => {
  return useQuery({
    queryKey: ['jobs', 'search', searchQuery],
    queryFn: () => fetchJobs(searchQuery),
    enabled: !!searchQuery && searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, 
  });
};
