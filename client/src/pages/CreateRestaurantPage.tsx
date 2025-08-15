import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRestaurant } from '../hooks/useRestaurant'
import { useCategories } from '../hooks/usageCategories';
import { showToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface FormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  imageUrl: string;
  priceRange: string;
  categoryIds: string[];
}

const CreateRestaurantPage: React.FC = () => {
  const navigate = useNavigate();
  const createRestaurantMutation = useCreateRestaurant();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    imageUrl: '',
    priceRange: '$$',
    categoryIds: []
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid image URL';
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = ['Please select at least one category'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((
    field: keyof FormData,
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  // Handle category selection
  const handleCategoryToggle = useCallback((categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));

    // Clear category error
    if (errors.categoryIds) {
      setErrors(prev => ({
        ...prev,
        categoryIds: undefined
      }));
    }
  }, [errors.categoryIds]);

  // Handle image URL change with preview
  const handleImageUrlChange = useCallback((url: string) => {
    handleInputChange('imageUrl', url);
    
    if (url && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  }, [handleInputChange]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error('Please fix the errors in the form');
      return;
    }

    try {
      await createRestaurantMutation.mutateAsync({
        ...formData,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      showToast.success('Restaurant created successfully!');
      navigate('/');
    } catch (error) {
      showToast.error('Failed to create restaurant. Please try again.');
    }
  };

  if (categoriesError) {
    return (
      <ErrorMessage
        message="Failed to load categories"
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-primary-600 hover:text-primary-700 self-start"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Back to Restaurants</span>
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Restaurant</h1>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Share a great restaurant with the community
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          
          {/* Restaurant Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter restaurant name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Describe the restaurant, cuisine, atmosphere..."
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Contact Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+40 21 123 4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://restaurant-website.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                errors.imageUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/restaurant-image.jpg"
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
            )}
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Restaurant preview"
                  className="w-full h-48 object-cover rounded-lg border"
                  onError={() => setImagePreview('')}
                />
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
              Price Range *
            </label>
            <select
              id="priceRange"
              value={formData.priceRange}
              onChange={(e) => handleInputChange('priceRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="$">$ - Budget (Under $15)</option>
              <option value="$$">$$ - Moderate ($15-30)</option>
              <option value="$$$">$$$ - Expensive ($30-60)</option>
              <option value="$$$$">$$$$ - Very Expensive ($60+)</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories * (Select all that apply)
            </label>
            
            {categoriesLoading ? (
              <LoadingSpinner size="sm" text="Loading categories..." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories?.map((category) => (
                  <label
                    key={category.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.categoryIds.includes(category.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-2">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            
            {errors.categoryIds && (
              <p className="mt-2 text-sm text-red-600">{errors.categoryIds}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRestaurantMutation.isPending}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {createRestaurantMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Restaurant'
              )}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Tips for adding a great restaurant
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Use high-quality images that showcase the food and atmosphere</li>
            <li>• Write a detailed description that highlights what makes this restaurant special</li>
            <li>• Include accurate contact information and address</li>
            <li>• Select all relevant categories to help people find the restaurant</li>
            <li>• Choose the appropriate price range to set proper expectations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurantPage;
