import { Module } from '@nestjs/common';

@Module({})
export class SwaggerModule {
  static forRoot() {
    return {
      module: SwaggerModule,
      providers: [],
      exports: [],
    };
  }
}
