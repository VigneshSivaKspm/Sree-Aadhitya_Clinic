import { listDoctors } from '../services/doctorService';
import { listServices, getServiceBySlug } from '../services/serviceService';
import { getProductBySlug, listCategories, listProducts } from '../services/productService';
import { listFaqs, listTestimonials } from '../services/contentService';
import { useAsync } from './useAsync';

// Thin data hooks over the service layer. Each returns { data, loading, error, reload }.
export const useDoctors = (practice) => useAsync(() => listDoctors(practice), [practice]);
export const useServices = (practice) => useAsync(() => listServices(practice), [practice]);
export const useService = (practice, slug) => useAsync(() => getServiceBySlug(practice, slug), [practice, slug]);
export const useProducts = () => useAsync(() => listProducts(), []);
export const useProduct = (slug) => useAsync(() => getProductBySlug(slug), [slug]);
export const useCategories = () => useAsync(() => listCategories(), []);
export const useTestimonials = (scope) => useAsync(() => listTestimonials(scope), [scope]);
export const useFaqs = (scope) => useAsync(() => listFaqs(scope), [scope]);
