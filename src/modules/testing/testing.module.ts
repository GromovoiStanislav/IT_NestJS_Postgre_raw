import { Module } from "@nestjs/common";
import { TestingController } from "./testing.controller";
import { DeleteAllDataUseCase } from "./testing.service";
import { CqrsModule } from "@nestjs/cqrs";


const useCases = [DeleteAllDataUseCase]

@Module({
  imports: [CqrsModule],
  controllers: [TestingController],
  providers: [...useCases],
  exports: []
})
export class TestingModule {
}