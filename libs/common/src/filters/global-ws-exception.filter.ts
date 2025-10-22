import { Catch, WsExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Ack } from "../utils/ack.helper";

@Catch(WsException)
export class GlobalWsExceptionFilter implements WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const message = exception.message || "Internal error";
    client.emit("ack", Ack.fail(message));
  }
}
