/**
 * Quality API 测试
 */

import { qualityApi } from '../api/quality';
import { apiClient } from '../api/instance';

// Mock apiClient
jest.mock('../api/instance', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('qualityApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('standardSubstance', () => {
    describe('getList', () => {
      it('should call apiClient.get with correct parameters', async () => {
        const params = { page: 1, pageSize: 10 };
        await qualityApi.standardSubstance.getList(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance', params);
      });
    });

    describe('create', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const data = { substanceName: 'Test Standard', substanceCode: 'TS001' };
        await qualityApi.standardSubstance.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/standard-substance', data);
      });
    });

    describe('update', () => {
      it('should call apiClient.put with correct parameters', async () => {
        const id = '123';
        const data = { substanceName: 'Updated Standard' };
        await qualityApi.standardSubstance.update(id, data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/quality/standard-substance/123', data);
      });
    });

    describe('getExpiring', () => {
      it('should call apiClient.get with default days parameter', async () => {
        await qualityApi.standardSubstance.getExpiring();
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/expiring', { days: 30 });
      });

      it('should call apiClient.get with custom days parameter', async () => {
        await qualityApi.standardSubstance.getExpiring(15);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/expiring', { days: 15 });
      });
    });

    describe('usageRecord', () => {
      describe('getList', () => {
        it('should call apiClient.get with correct parameters', async () => {
          const params = { page: 1, pageSize: 10 };
          await qualityApi.standardSubstance.usageRecord.getList(params);
          
          expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/usage', params);
        });
      });

      describe('create', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const data = { substanceId: '123', usedAmount: 10 };
          await qualityApi.standardSubstance.usageRecord.create(data);
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/standard-substance/usage', data);
        });
      });
    });

    describe('dilutionRecord', () => {
      describe('getList', () => {
        it('should call apiClient.get with correct parameters', async () => {
          const params = { page: 1, pageSize: 10 };
          await qualityApi.standardSubstance.dilutionRecord.getList(params);
          
          expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/dilution', params);
        });
      });

      describe('create', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const data = { substanceId: '123', dilutionRatio: '1:10' };
          await qualityApi.standardSubstance.dilutionRecord.create(data);
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/standard-substance/dilution', data);
        });
      });
    });
  });

  describe('environment', () => {
    describe('getList', () => {
      it('should call apiClient.get with correct parameters', async () => {
        const params = { page: 1, pageSize: 10 };
        await qualityApi.environment.getList(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/environment', params);
      });
    });

    describe('create', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const data = { location: 'Lab A', temperature: 25, humidity: 60 };
        await qualityApi.environment.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/environment', data);
      });
    });

    describe('getLatest', () => {
      it('should call apiClient.get with correct parameters', async () => {
        const location = 'Lab A';
        await qualityApi.environment.getLatest(location);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/environment/latest', { location });
      });
    });
  });

  describe('nonconformity', () => {
    describe('getList', () => {
      it('should call apiClient.get with correct parameters', async () => {
        const params = { page: 1, pageSize: 10 };
        await qualityApi.nonconformity.getList(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/nonconformity', params);
      });
    });

    describe('create', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const data = { title: 'Test Issue', description: 'Test description' };
        await qualityApi.nonconformity.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/nonconformity', data);
      });
    });

    describe('update', () => {
      it('should call apiClient.put with correct parameters', async () => {
        const id = '123';
        const data = { status: 'closed' as const };
        await qualityApi.nonconformity.update(id, data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/quality/nonconformity/123', data);
      });
    });

    describe('submitAnalysis', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const id = '123';
        const data = { rootCause: 'Equipment failure', analysisBy: 'John Doe' };
        await qualityApi.nonconformity.submitAnalysis(id, data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/nonconformity/123/analysis', data);
      });
    });
  });

  describe('document', () => {
    describe('controlledList', () => {
      describe('getList', () => {
        it('should call apiClient.get with correct parameters', async () => {
          const params = { page: 1, pageSize: 10 };
          await qualityApi.document.controlledList.getList(params);
          
          expect(mockApiClient.get).toHaveBeenCalledWith('/quality/document/controlled', params);
        });
      });

      describe('create', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const data = { docName: 'Test Document', version: '1.0' };
          await qualityApi.document.controlledList.create(data);
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/document/controlled', data);
        });
      });

      describe('update', () => {
        it('should call apiClient.put with correct parameters', async () => {
          const id = '123';
          const data = { version: '1.1' };
          await qualityApi.document.controlledList.update(id, data);
          
          expect(mockApiClient.put).toHaveBeenCalledWith('/quality/document/controlled/123', data);
        });
      });
    });

    describe('composeApply', () => {
      describe('getList', () => {
        it('should call apiClient.get with correct parameters', async () => {
          const params = { page: 1, pageSize: 10 };
          await qualityApi.document.composeApply.getList(params);
          
          expect(mockApiClient.get).toHaveBeenCalledWith('/quality/document/compose-apply', params);
        });
      });

      describe('create', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const data = { docName: 'New Document Request', reason: 'Testing' };
          await qualityApi.document.composeApply.create(data);
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/document/compose-apply', data);
        });
      });

      describe('approve', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const id = '123';
          await qualityApi.document.composeApply.approve(id, true, 'Approved');
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/document/compose-apply/123/approve', {
            approved: true,
            comment: 'Approved'
          });
        });
      });
    });

    describe('issueApprove', () => {
      describe('getList', () => {
        it('should call apiClient.get with correct parameters', async () => {
          const params = { page: 1, pageSize: 10 };
          await qualityApi.document.issueApprove.getList(params);
          
          expect(mockApiClient.get).toHaveBeenCalledWith('/quality/document/issue-approve', params);
        });
      });

      describe('create', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const data = { docCode: '123', composer: 'John Doe' };
          await qualityApi.document.issueApprove.create(data);
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/document/issue-approve', data);
        });
      });

      describe('review', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const id = '123';
          await qualityApi.document.issueApprove.review(id, 'pass', 'Looks good');
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/document/issue-approve/123/review', {
            result: 'pass',
            comment: 'Looks good'
          });
        });
      });

      describe('approve', () => {
        it('should call apiClient.post with correct parameters', async () => {
          const id = '123';
          await qualityApi.document.issueApprove.approve(id, true, 'Final approval');
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/document/issue-approve/123/approve', {
            approved: true,
            comment: 'Final approval'
          });
        });
      });
    });
  });

  describe('waste', () => {
    describe('getList', () => {
      it('should call apiClient.get with correct parameters', async () => {
        const params = { page: 1, pageSize: 10 };
        await qualityApi.waste.getList(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/waste', params);
      });
    });

    describe('create', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const data = { type: 'Chemical', amount: 5, unit: 'kg' };
        await qualityApi.waste.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/waste', data);
      });
    });

    describe('dispose', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const id = '123';
        await qualityApi.waste.dispose(id);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/waste/123/dispose');
      });
    });
  });

  describe('visitor', () => {
    describe('getList', () => {
      it('should call apiClient.get with correct parameters', async () => {
        const params = { page: 1, pageSize: 10 };
        await qualityApi.visitor.getList(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/visitor', params);
      });
    });

    describe('register', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const data = { visitorName: 'John Visitor', visitorCompany: 'ABC Corp', visitPurpose: 'Audit' };
        await qualityApi.visitor.register(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/visitor', data);
      });
    });

    describe('exit', () => {
      it('should call apiClient.post with correct parameters', async () => {
        const id = '123';
        await qualityApi.visitor.exit(id);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/visitor/123/exit');
      });
    });
  });
});