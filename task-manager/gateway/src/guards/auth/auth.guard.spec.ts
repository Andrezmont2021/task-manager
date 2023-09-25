import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: 'Bearer mockToken',
        },
      }),
    }),
  } as ExecutionContext;

  const mockContextEmpty = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should return true if token is valid', async () => {
    const payload = { sub: '123' };
    mockJwtService.verifyAsync.mockResolvedValue(payload);

    const result = await authGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('mockToken', {
      secret: process.env.JWT_SECRET,
    });
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    await expect(authGuard.canActivate(mockContextEmpty)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should throw UnauthorizedException if token is invalid', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('mockToken', {
      secret: process.env.JWT_SECRET,
    });
  });
});
