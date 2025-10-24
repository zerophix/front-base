/**
 * Equipment API 测试
 */

import { equipmentApi } from '../../services/api/equipment';
import { apiClient } from '../../services/api/instance';
import type { Result, ApiErrorResponse } from '../../types/core';

// Mock apiClient
jest.mock('../../services/api/instance', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('equipmentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('equipment', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 }, keyword: 'test' };
        await equipmentApi.equipment.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment', { params });
      });
    });

    describe('getById', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', equipmentName: 'Test Equipment' }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        await equipmentApi.equipment.getById('123');
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/123');
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', equipmentName: 'New Equipment' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { equipmentName: 'New Equipment', equipmentCode: 'EQ001' };
        await equipmentApi.equipment.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment', data);
      });
    });

    describe('update', () => {
      it('should call the correct API endpoint with id and data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', equipmentName: 'Updated Equipment' }
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const data = { id: '123', equipmentName: 'Updated Equipment' };
        await equipmentApi.equipment.update(data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/equipment/123', { equipmentName: 'Updated Equipment' });
      });
    });

    describe('delete', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: undefined
        };
        mockApiClient.delete.mockResolvedValue(mockResponse);

        await equipmentApi.equipment.delete('123');
        
        expect(mockApiClient.delete).toHaveBeenCalledWith('/equipment/123');
      });
    });

    describe('getDueCalibrationList', () => {
      it('should call the correct API endpoint', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: []
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        await equipmentApi.equipment.getDueCalibrationList();
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/calibration/due');
      });
    });
  });

  describe('calibration', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.calibration.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/calibration', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', equipmentName: 'Test Equipment', date: '2024-01-01' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { equipmentName: 'Test Equipment', date: '2024-01-01', records: [] };
        await equipmentApi.calibration.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/calibration', data);
      });
    });
  });

  describe('useRecord', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.useRecord.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/use-record', { params });
      });
    });

    describe('complete', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', status: 'completed' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await equipmentApi.useRecord.complete('123');
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/use-record/123/complete');
      });
    });
  });

  describe('maintenance', () => {
    describe('getRecords', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.maintenance.getRecords(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/maintenance/records', { params });
      });
    });

    describe('createRecord', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', equipmentId: '456', maintenanceType: 'daily' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { 
          equipmentId: '456', 
          maintenanceType: 'daily' as any,
          maintenanceDate: '2024-01-01',
          maintainer: 'Test User',
          maintenanceContent: 'Test maintenance',
          result: 'normal' as any
        };
        await equipmentApi.maintenance.createRecord(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/maintenance/records', data);
      });
    });

    describe('getPlans', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.maintenance.getPlans(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/maintenance/plans', { params });
      });
    });

    describe('createPlan', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', planName: 'Monthly Maintenance', frequency: 'monthly' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { planName: 'Monthly Maintenance', frequency: 'monthly' };
        await equipmentApi.maintenance.createPlan(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/maintenance/plans', data);
      });
    });

    describe('executePlan', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', status: 'executed' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await equipmentApi.maintenance.executePlan('123');
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/maintenance/plans/123/execute');
      });
    });
  });

  describe('borrow', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.borrow.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/borrow', { params });
      });
    });

    describe('approve', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', status: 'approved' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await equipmentApi.borrow.approve('123', true, 'Approved');
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/borrow/123/approve', { approved: true, comment: 'Approved' });
      });
    });

    describe('return', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', status: 'returned' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await equipmentApi.borrow.return('123');
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/borrow/123/return');
      });
    });
  });

  describe('scrap', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.scrap.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/scrap', { params });
      });
    });

    describe('approve', () => {
      it('should call the correct API endpoint with approval data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', status: 'approved' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await equipmentApi.scrap.approve('123', true, 'Approved for scrap');
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/scrap/123/approve', { approved: true, comment: 'Approved for scrap' });
      });
    });
  });

  describe('acceptance', () => {
    describe('list', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await equipmentApi.acceptance.list(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/acceptance', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', status: 'submitted' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { equipmentName: 'Test Equipment', acceptanceResult: 'passed' as any };
        await equipmentApi.acceptance.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/acceptance', data);
      });
    });
  });
});