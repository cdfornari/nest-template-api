import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [AuthModule]
})
export class MessagesModule {}
