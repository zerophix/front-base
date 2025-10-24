/**
 * Personnel API 测试
 */

import { 
  personnelApi, 
  personnelRegistrationApi, 
  personnelChangeApi, 
  personnelQualificationApi, 
  trainingRecordApi, 
  trainingPlanApi 
} from '../../services/api/personnel';
import { apiClient } from '../../services/api/instance';
import type { Result, ApiErrorResponse } from '@/types/core';
import { PersonnelChangeType } from '@/types/personnel';

// Mock the API client
jest.mock('../../services/api/instance', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('personnelApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('personnel', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await personnelApi.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel', { params });
      });
    });

    describe('getById', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', name: 'Test User' }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        await personnelApi.getById('1');
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/1');
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', name: 'Test User' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { name: 'Test User', department: 'IT' };
        await personnelApi.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel', data);
      });
    });

    describe('update', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', name: 'Updated User' }
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const data = { id: '1', name: 'Updated User' };
        await personnelApi.update(data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/1', { name: 'Updated User' });
      });
    });

    describe('delete', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: undefined
        };
        mockApiClient.delete.mockResolvedValue(mockResponse);

        await personnelApi.delete('1');
        
        expect(mockApiClient.delete).toHaveBeenCalledWith('/personnel/1');
      });
    });

    describe('batchDelete', () => {
      it('should call the correct API endpoint with ids', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: undefined
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const ids = ['1', '2', '3'];
        await personnelApi.batchDelete(ids);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/batch-delete', { ids });
      });
    });
  });

  describe('personnelRegistration', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await personnelRegistrationApi.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/registration', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', name: 'New Registration' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { name: 'New Registration', department: 'HR' };
        await personnelRegistrationApi.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/registration', data);
      });
    });
  });

  describe('personnelChange', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await personnelChangeApi.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/change', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', changeType: 'position' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { changeType: PersonnelChangeType.Transfer, personnelId: '123' };
         await personnelChangeApi.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/change', data);
      });
    });
  });

  describe('personnelQualification', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await personnelQualificationApi.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/qualification', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', qualificationType: 'certification' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { qualificationType: 'certification', personnelId: '123' };
        await personnelQualificationApi.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/qualification', data);
      });
    });

    describe('update', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', qualificationType: 'updated certification' }
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const data = { id: '1', qualificationType: 'updated certification' };
        await personnelQualificationApi.update(data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/qualification/1', { qualificationType: 'updated certification' });
      });
    });
  });

  describe('trainingRecord', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await trainingRecordApi.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/training/record', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', trainingName: 'Safety Training' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { trainingName: 'Safety Training', personnelId: '123' };
        await trainingRecordApi.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/training/record', data);
      });
    });

    describe('update', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', trainingName: 'Updated Training' }
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const data = { id: '1', trainingName: 'Updated Training' };
        await trainingRecordApi.update(data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/training/record/1', { trainingName: 'Updated Training' });
      });
    });
  });

  describe('trainingPlan', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await trainingPlanApi.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/training/plan', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', planName: 'Annual Training Plan' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { planName: 'Annual Training Plan', planYear: 2024 };
        await trainingPlanApi.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/training/plan', data);
      });
    });

    describe('update', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '1', planName: 'Updated Training Plan' }
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const data = { id: '1', planName: 'Updated Training Plan' };
        await trainingPlanApi.update(data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/training/plan/1', { planName: 'Updated Training Plan' });
      });
    });
  });
});