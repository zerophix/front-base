/**
 * Equipment API 测试
 */

import { equipmentApi } from '../api/equipment';
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

describe('equipmentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本CRUD操作', () => {
    it('should call get method for equipment list', async () => {
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
      await equipmentApi.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment', params);
    });

    it('should call get method for equipment by id', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await equipmentApi.getById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/1');
    });

    it('should call post method for creating equipment', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const equipmentData = {};
      await equipmentApi.create(equipmentData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment', equipmentData);
    });

    it('should call put method for updating equipment', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await equipmentApi.update('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/equipment/1', updateData);
    });

    it('should call delete method for deleting equipment', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: undefined,
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      await equipmentApi.delete('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/equipment/1');
    });
  });

  describe('设备检校相关', () => {
    it('should call get method for calibration list', async () => {
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
      await equipmentApi.calibration.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/calibration', params);
    });

    it('should call post method for creating calibration record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const calibrationData = {};
      await equipmentApi.calibration.create(calibrationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/calibration', calibrationData);
    });

    it('should call put method for updating calibration record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const updateData = {};
      await equipmentApi.calibration.update('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/equipment/calibration/1', updateData);
    });

    it('should call get method for due calibration list', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: [],
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      await equipmentApi.calibration.getDueList();

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/calibration/due');
    });
  });

  describe('设备使用记录', () => {
    it('should call get method for use record list', async () => {
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
      await equipmentApi.useRecord.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/use-record', params);
    });

    it('should call post method for creating use record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const recordData = {};
      await equipmentApi.useRecord.create(recordData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/use-record', recordData);
    });

    it('should call post method for completing use record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await equipmentApi.useRecord.complete('1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/use-record/1/complete');
    });
  });

  describe('设备维护', () => {
    it('should call get method for maintenance records', async () => {
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
      await equipmentApi.maintenance.getRecords(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/maintenance/record', params);
    });

    it('should call post method for creating maintenance record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const recordData = {};
      await equipmentApi.maintenance.createRecord(recordData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/maintenance/record', recordData);
    });
  });

  describe('设备借用', () => {
    it('should call get method for borrow list', async () => {
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
      await equipmentApi.borrow.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/borrow', params);
    });

    it('should call post method for borrow application', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const applyData = {};
      await equipmentApi.borrow.apply(applyData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/borrow', applyData);
    });

    it('should call post method for borrow approval', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await equipmentApi.borrow.approve('1', true, 'Approved');

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/borrow/1/approve', {
        approved: true,
        comment: 'Approved',
      });
    });

    it('should call post method for equipment return', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await equipmentApi.borrow.return('1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/borrow/1/return');
    });
  });

  describe('设备报废', () => {
    it('should call get method for scrap list', async () => {
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
      await equipmentApi.scrap.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/scrap', params);
    });

    it('should call post method for scrap application', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const applyData = {};
      await equipmentApi.scrap.apply(applyData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/scrap', applyData);
    });

    it('should call post method for scrap approval', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      await equipmentApi.scrap.approve('1', true, 'Approved for scrap');

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/scrap/1/approve', {
        approved: true,
        comment: 'Approved for scrap',
      });
    });
  });

  describe('设备验收', () => {
    it('should call get method for acceptance list', async () => {
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
      await equipmentApi.acceptance.getList(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/equipment/acceptance', params);
    });

    it('should call post method for creating acceptance record', async () => {
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {},
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const acceptanceData = {};
      await equipmentApi.acceptance.create(acceptanceData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/equipment/acceptance', acceptanceData);
    });
  });
});