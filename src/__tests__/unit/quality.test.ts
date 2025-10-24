/**
 * Quality API 测试
 */

import { qualityApi } from '../../services/api/quality';
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

describe('qualityApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('standardSubstance', () => {
    describe('getList', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
        await qualityApi.standardSubstance.getList(params);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance', { params });
      });
    });

    describe('getById', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', substanceName: 'Test' }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        await qualityApi.standardSubstance.getById('123');
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/123');
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', substanceName: 'Test Standard' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { substanceName: 'Test Standard', substanceCode: 'TS001' };
        await qualityApi.standardSubstance.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/standard-substance', data);
      });
    });

    describe('update', () => {
      it('should call the correct API endpoint with id and data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', substanceName: 'Updated Standard' }
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const id = '123';
        const data = { substanceName: 'Updated Standard' };
        await qualityApi.standardSubstance.update(id, data);
        
        expect(mockApiClient.put).toHaveBeenCalledWith('/quality/standard-substance/123', data);
      });
    });

    describe('delete', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: undefined
        };
        mockApiClient.delete.mockResolvedValue(mockResponse);

        await qualityApi.standardSubstance.delete('123');
        
        expect(mockApiClient.delete).toHaveBeenCalledWith('/quality/standard-substance/123');
      });
    });

    describe('getExpiring', () => {
      it('should call the correct API endpoint with default days parameter', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: []
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        await qualityApi.standardSubstance.getExpiring();
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/expiring', { params: { days: 30 } });
      });

      it('should call the correct API endpoint with custom days parameter', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: []
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        await qualityApi.standardSubstance.getExpiring(15);
        
        expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/expiring', { params: { days: 15 } });
      });
    });

    describe('usageRecord', () => {
      describe('getList', () => {
        it('should call the correct API endpoint with parameters', async () => {
          const mockResponse: Result<any, ApiErrorResponse> = {
            success: true,
            data: { items: [], total: 0 }
          };
          mockApiClient.get.mockResolvedValue(mockResponse);

          const params = { pagination: { page: 1, pageSize: 10 } };
           await qualityApi.standardSubstance.usageRecord.getList(params);
           
           expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/usage', { params });
        });
      });

      describe('create', () => {
        it('should call the correct API endpoint with data', async () => {
          const mockResponse: Result<any, ApiErrorResponse> = {
            success: true,
            data: { id: '123', substanceId: '123', usedAmount: 10 }
          };
          mockApiClient.post.mockResolvedValue(mockResponse);

          const data = { substanceId: '123', usedAmount: 10 };
          await qualityApi.standardSubstance.usageRecord.create(data);
          
          expect(mockApiClient.post).toHaveBeenCalledWith('/quality/standard-substance/usage', data);
        });
      });
    });

    describe('dilutionRecord', () => {
      describe('getList', () => {
        it('should call the correct API endpoint with parameters', async () => {
          const mockResponse: Result<any, ApiErrorResponse> = {
            success: true,
            data: { items: [], total: 0 }
          };
          mockApiClient.get.mockResolvedValue(mockResponse);

          const params = { pagination: { page: 1, pageSize: 10 } };
           await qualityApi.standardSubstance.dilutionRecord.getList(params);
           
           expect(mockApiClient.get).toHaveBeenCalledWith('/quality/standard-substance/dilution', { params });
         });
       });

       describe('create', () => {
         it('should call the correct API endpoint with data', async () => {
           const mockResponse: Result<any, ApiErrorResponse> = {
             success: true,
             data: { id: '123', substanceId: '123', dilutionRatio: '1:10' }
           };
           mockApiClient.post.mockResolvedValue(mockResponse);

           const data = { substanceId: '123', dilutionRatio: '1:10' };
           await qualityApi.standardSubstance.dilutionRecord.create(data);
           
           expect(mockApiClient.post).toHaveBeenCalledWith('/quality/standard-substance/dilution', data);
         });
       });
     });
   });

   describe('environment', () => {
     describe('getList', () => {
       it('should call the correct API endpoint with parameters', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { items: [], total: 0 }
         };
         mockApiClient.get.mockResolvedValue(mockResponse);

         const params = { pagination: { page: 1, pageSize: 10 }, location: 'Lab A' };
         await qualityApi.environment.getList(params);
         
         expect(mockApiClient.get).toHaveBeenCalledWith('/quality/environment', { params });
       });
     });

     describe('create', () => {
       it('should call the correct API endpoint with data', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { id: '123', location: 'Lab A', temperature: 25, humidity: 60 }
         };
         mockApiClient.post.mockResolvedValue(mockResponse);

         const data = { location: 'Lab A', temperature: 25, humidity: 60 };
         await qualityApi.environment.create(data);
         
         expect(mockApiClient.post).toHaveBeenCalledWith('/quality/environment', data);
       });
     });

     describe('getLatest', () => {
       it('should call the correct API endpoint with location parameter', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { id: '123', location: 'Lab A', temperature: 25, humidity: 60 }
         };
         mockApiClient.get.mockResolvedValue(mockResponse);

         const location = 'Lab A';
         await qualityApi.environment.getLatest(location);
         
         expect(mockApiClient.get).toHaveBeenCalledWith('/quality/environment/latest', { params: { location } });
       });
     });
   });

   describe('nonconformity', () => {
     describe('getList', () => {
       it('should call the correct API endpoint with parameters', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { items: [], total: 0 }
         };
         mockApiClient.get.mockResolvedValue(mockResponse);

         const params = { pagination: { page: 1, pageSize: 10 } };
         await qualityApi.nonconformity.getList(params);
         
         expect(mockApiClient.get).toHaveBeenCalledWith('/quality/nonconformity', { params });
      });
    });

    describe('create', () => {
      it('should call the correct API endpoint with data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', title: 'Test Issue', description: 'Test description' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const data = { title: 'Test Issue', description: 'Test description' };
        await qualityApi.nonconformity.create(data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/nonconformity', data);
      });
    });

    describe('submitAnalysis', () => {
      it('should call the correct API endpoint with analysis data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', rootCause: 'Equipment failure', analysisBy: 'John Doe' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const id = '123';
        const data = { rootCause: 'Equipment failure', analysisBy: 'John Doe' };
        await qualityApi.nonconformity.submitAnalysis(id, data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/nonconformity/123/analysis', data);
      });
    });

    describe('submitCorrectiveAction', () => {
      it('should call the correct API endpoint with corrective action data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', correctiveAction: 'Replace equipment', responsiblePerson: 'Jane Doe', targetDate: '2024-01-01' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const id = '123';
        const data = { correctiveAction: 'Replace equipment', responsiblePerson: 'Jane Doe', targetDate: '2024-01-01' };
        await qualityApi.nonconformity.submitCorrectiveAction(id, data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/nonconformity/123/corrective-action', data);
      });
    });

    describe('verify', () => {
      it('should call the correct API endpoint with verification data', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', verificationResult: 'Verified', verifiedBy: 'Manager' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const id = '123';
        const data = { verificationResult: 'Verified', verifiedBy: 'Manager' };
        await qualityApi.nonconformity.verify(id, data);
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/nonconformity/123/verify', data);
      });
    });
  });

  describe('waste', () => {
    describe('getList', () => {
      it('should call the correct API endpoint with parameters', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { items: [], total: 0 }
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const params = { pagination: { page: 1, pageSize: 10 } };
         await qualityApi.waste.getList(params);
         
         expect(mockApiClient.get).toHaveBeenCalledWith('/quality/waste', { params });
       });
     });

     describe('dispose', () => {
       it('should call the correct API endpoint with id', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { id: '123', status: 'disposed' }
         };
         mockApiClient.post.mockResolvedValue(mockResponse);

         await qualityApi.waste.dispose('123');
         
         expect(mockApiClient.post).toHaveBeenCalledWith('/quality/waste/123/dispose');
       });
     });
   });

   describe('visitor', () => {
     describe('getList', () => {
       it('should call the correct API endpoint with parameters', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { items: [], total: 0 }
         };
         mockApiClient.get.mockResolvedValue(mockResponse);

         const params = { pagination: { page: 1, pageSize: 10 } };
         await qualityApi.visitor.getList(params);
         
         expect(mockApiClient.get).toHaveBeenCalledWith('/quality/visitor', { params });
       });
     });

     describe('register', () => {
       it('should call the correct API endpoint with visitor data', async () => {
         const mockResponse: Result<any, ApiErrorResponse> = {
           success: true,
           data: { id: '123', visitorName: 'John Visitor', visitorCompany: 'ABC Corp' }
         };
         mockApiClient.post.mockResolvedValue(mockResponse);

         const data = { visitorName: 'John Visitor', visitorCompany: 'ABC Corp' };
         await qualityApi.visitor.register(data);
         
         expect(mockApiClient.post).toHaveBeenCalledWith('/quality/visitor/register', data);
      });
    });

    describe('exit', () => {
      it('should call the correct API endpoint with id', async () => {
        const mockResponse: Result<any, ApiErrorResponse> = {
          success: true,
          data: { id: '123', exitTime: '2024-01-01T10:00:00Z' }
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await qualityApi.visitor.exit('123');
        
        expect(mockApiClient.post).toHaveBeenCalledWith('/quality/visitor/123/exit');
      });
    });
  });
});