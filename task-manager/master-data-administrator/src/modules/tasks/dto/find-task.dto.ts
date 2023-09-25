import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';

export class FindTaskDto {
  id: number;

  title: string;

  description: string;

  status: string;

  user: UpdateUserDto;
}
