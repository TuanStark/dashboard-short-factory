import {
  ChannelListResponse,
  ConfigureChannelRequest,
  GenreListResponse,
  ProduceRequest,
  ProduceResponse,
  BatchProduceRequest,
  BatchResponse,
  TopicListResponse,
  ApprovalCallbackRequest,
  ApprovalCallbackResponse,
  ScheduleResponse,
  TriggerScheduleRequest,
  HealthCheckResponse,
  GenreProfile,
} from '@short-factory/contracts';

class ApiClient {
  private baseUrl: string;

  constructor() {
    // In browser, use empty string so requests hit the Vite proxy (/api, /health)
    // or explicit VITE_API_BASE_URL if configured
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  }

  // Health
  async getHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  // Channels
  async getChannels(): Promise<ChannelListResponse> {
    return this.request<ChannelListResponse>('/api/v2/channels');
  }

  async configureChannel(data: ConfigureChannelRequest): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/v2/channels/configure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Genres
  async getGenres(): Promise<GenreListResponse> {
    return this.request<GenreListResponse>('/api/v2/genres');
  }

  async updateGenre(
    id: string,
    data: Partial<GenreProfile>,
  ): Promise<{ success: boolean; message: string; data: GenreProfile }> {
    return this.request<{ success: boolean; message: string; data: GenreProfile }>(
      `/api/v2/genres/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  // Production Pipeline
  async produceVideo(data: ProduceRequest): Promise<ProduceResponse> {
    return this.request<ProduceResponse>('/api/v2/pipeline/produce', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async produceBatch(data: BatchProduceRequest): Promise<BatchResponse> {
    return this.request<BatchResponse>('/api/v2/pipeline/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Topics & HITL Approval
  async getTopics(): Promise<TopicListResponse> {
    return this.request<TopicListResponse>('/api/topics');
  }

  async approveTopic(data: ApprovalCallbackRequest): Promise<ApprovalCallbackResponse> {
    return this.request<ApprovalCallbackResponse>('/api/approval/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Schedule
  async getSchedule(): Promise<ScheduleResponse> {
    return this.request<ScheduleResponse>('/api/schedule');
  }

  async triggerSchedule(data: TriggerScheduleRequest): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/api/v2/schedule/trigger', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
