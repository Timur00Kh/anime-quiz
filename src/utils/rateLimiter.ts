class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestTimes: number[] = [];
  private readonly rps: number;
  private readonly rpm: number;

  constructor(rps: number = 5, rpm: number = 90) {
    this.rps = rps;
    this.rpm = rpm;
  }

  private cleanOldRequests() {
    const now = Date.now();
    // Remove requests older than 1 minute
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);
  }

  private canMakeRequest(): boolean {
    const now = Date.now();
    this.cleanOldRequests();

    // Check RPM limit
    if (this.requestTimes.length >= this.rpm) {
      return false;
    }

    // Check RPS limit
    const lastSecond = this.requestTimes.filter(time => now - time < 1000);
    return lastSecond.length < this.rps;
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      if (this.canMakeRequest()) {
        const request = this.queue.shift();
        if (request) {
          this.requestTimes.push(Date.now());
          try {
            await request();
          } catch (error) {
            console.error('Error processing request:', error);
          }
        }
      } else {
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    this.processing = false;
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter(5, 90); 