/**
 * Personnel API 测试
 */

import { personnelApi } from '../api/personnel';
import { apiClient } from '../api/instance';

// Mock the API client
jest.mock('../api/instance', () => ({
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

  describe('基本人员管理', () => {
    it('should call get method for personnel list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10 };
      await personnelApi.getPersonnelList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel', params);
    });

    it('should call get method for personnel by id', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await personnelApi.getPersonnelById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/1');
    });

    it('should call post method for creating personnel', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const personnelData = {};
      await personnelApi.createPersonnel(personnelData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel', personnelData);
    });

    it('should call put method for updating personnel', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await personnelApi.updatePersonnel('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/1', updateData);
    });

    it('should call delete method for deleting personnel', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: undefined,
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      await personnelApi.deletePersonnel('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/personnel/1');
    });

    it('should call post method for batch deleting personnel', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: undefined,
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const ids = ['1', '2', '3'];
      await personnelApi.batchDeletePersonnel(ids);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/batch-delete', { ids });
    });

    it('should call get method for exporting personnel', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: new Blob(),
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { format: 'xlsx' };
      await personnelApi.exportPersonnel(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/export', params, {
        headers: { 'Accept': 'application/vnd.ms-excel' },
      });
    });

    it('should call post method for importing personnel', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: { success: 10, failed: 0 },
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const file = new File([''], 'test.xlsx');
      await personnelApi.importPersonnel(file);

      const formData = new FormData();
      formData.append('file', file);
      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });
  });

  describe('人员注册', () => {
    it('should call get method for registration list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10 };
      await personnelApi.registration.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/registration', params);
    });

    it('should call get method for registration by id', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await personnelApi.registration.getById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/registration/1');
    });

    it('should call post method for creating registration', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const registrationData = {};
      await personnelApi.registration.create(registrationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/registration', registrationData);
    });

    it('should call put method for updating registration', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await personnelApi.registration.update('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/registration/1', updateData);
    });

    it('should call delete method for deleting registration', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: undefined,
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      await personnelApi.registration.delete('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/personnel/registration/1');
    });
  });

  describe('人员变更', () => {
    it('should call get method for change list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10 };
      await personnelApi.change.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/change', params);
    });

    it('should call post method for creating change', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const changeData = {};
      await personnelApi.change.create(changeData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/change', changeData);
    });

    it('should call post method for approving change', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await personnelApi.change.approve('1', true, 'Approved');

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/change/1/approve', {
        approved: true,
        comment: 'Approved',
      });
    });
  });

  describe('人员资质', () => {
    it('should call get method for qualification list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10 };
      await personnelApi.qualification.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/qualification', params);
    });

    it('should call post method for creating qualification', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const qualificationData = {};
      await personnelApi.qualification.create(qualificationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/qualification', qualificationData);
    });

    it('should call put method for updating qualification', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await personnelApi.qualification.update('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/qualification/1', updateData);
    });

    it('should call get method for expiring qualifications', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: [],
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await personnelApi.qualification.getExpiring(30);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/qualification/expiring', { days: 30 });
    });
  });

  describe('培训记录', () => {
    it('should call get method for training list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10 };
      await personnelApi.training.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/training/record', params);
    });

    it('should call post method for creating training record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const trainingData = {};
      await personnelApi.training.create(trainingData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/training/record', trainingData);
    });

    it('should call put method for updating training record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await personnelApi.training.update('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/training/record/1', updateData);
    });
  });

  describe('培训计划', () => {
    it('should call get method for training plan list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, pageSize: 10 };
      await personnelApi.trainingPlan.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/personnel/training/plan', params);
    });

    it('should call post method for creating training plan', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const planData = {};
      await personnelApi.trainingPlan.create(planData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/training/plan', planData);
    });

    it('should call put method for updating training plan', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await personnelApi.trainingPlan.update('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/personnel/training/plan/1', updateData);
    });

    it('should call post method for executing training plan', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await personnelApi.trainingPlan.execute('1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/personnel/training/plan/1/execute');
    });
  });
});