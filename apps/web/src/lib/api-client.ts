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
  LoginRequest,
  AuthResponse,
  User,
} from '@short-factory/contracts';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // In browser, use empty string so requests hit the Vite proxy (/api, /health)
    // or explicit VITE_API_BASE_URL if configured
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('short_factory_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('short_factory_token', token);
      } else {
        localStorage.removeItem('short_factory_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.setToken(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }

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

  // Authentication & Identity
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v2/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response?.accessToken) {
      this.setToken(response.accessToken);
    }
    return response;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/v2/auth/me');
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
