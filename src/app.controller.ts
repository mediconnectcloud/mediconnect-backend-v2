import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // GET / - useful for confirming the server is up (and for the
  // deployment health check once this runs behind the load balancer)
  @Get()
  health() {
    return { status: 'ok', service: 'mediconnect-backend' };
  }
}
