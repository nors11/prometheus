import { Serializer, OutgoingResponse } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

export class OutboundResponseSerializer implements Serializer {
    
    private readonly logger = new Logger('OutboundResponseSerializer');
    
    serialize(value: any): OutgoingResponse {
      this.logger.log(`-->> Serializing outbound response: ${JSON.stringify(value)}`);
      return value.data;
    }
}