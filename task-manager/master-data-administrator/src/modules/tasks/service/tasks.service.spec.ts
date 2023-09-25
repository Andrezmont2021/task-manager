import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../../modules/users/entities/user.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { FindTaskDto } from '../dto/find-task.dto';
import { CustomException } from '../../../utils/custom-exception';
import { UpdateTaskDto } from '../dto/update-task.dto';

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'Test Status',
        user: 1,
      };

      const taskEntity = new Task();
      taskEntity.id = 1;
      taskEntity.title = createTaskDto.title;

      jest.spyOn(taskRepository, 'save').mockResolvedValue(taskEntity);

      // Act
      const result: FindTaskDto = await tasksService.create(createTaskDto);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({ id: 1, title: createTaskDto.title }),
      ); // Verify that the result matches
      expect(taskRepository.save).toHaveBeenCalledWith(expect.any(Task)); // Verify that the save method was called with a Task entity
    });
  });

  describe('findAll', () => {
    it('should return an array of FindTaskDto', async () => {
      const taskEntity1 = new Task(); // Create Task entities
      const taskEntity2 = new Task();
      taskEntity1.title = 'Task 1';
      taskEntity2.title = 'Task 2';

      const tasksArray = [taskEntity1, taskEntity2]; // Create an array of Task entities

      jest.spyOn(taskRepository, 'find').mockResolvedValue(tasksArray); // Mock the find method

      // Act
      const result: FindTaskDto[] = await tasksService.findAll();

      // Assert
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Task 1' }), // Verify that Task 1 is in the result
          expect.objectContaining({ title: 'Task 2' }), // Verify that Task 2 is in the result
        ]),
      );
      expect(taskRepository.find).toHaveBeenCalledWith({ relations: ['user'] }); // Verify that the find method was called with the correct options
    });
  });

  describe('findOne', () => {
    it('should return a FindTaskDto when a task with the given ID exists', async () => {
      const taskId = 1;
      const taskEntity = new Task(); // Create a Task entity
      taskEntity.id = taskId;
      taskEntity.title = 'Test Task';

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(taskEntity); // Mock the findOne method

      // Act
      const result: FindTaskDto = await tasksService.findOne(taskId);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({ id: taskId, title: 'Test Task' }),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      }); // Verify that the findOne method was called with the correct options
    });

    it('should throw CustomException when a task with the given ID does not exist', async () => {
      const taskId = 1;
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null); // Mock the findOne method to return null

      // Act and Assert
      await expect(tasksService.findOne(taskId)).rejects.toThrowError(
        new CustomException(`Task not found with id ${taskId}`, 404),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      }); // Verify that the findOne method was called with the correct options
    });
  });

  describe('update', () => {
    it('should update a task and return a FindTaskDto when a task with the given ID exists', async () => {
      const taskId = 1;
      const userId = 2;
      const taskEntity = new Task(); // Create a Task entity
      taskEntity.id = taskId;
      taskEntity.title = 'Old Task Title';
      taskEntity.user = {
        id: 2,
        email: 'test-email@domain.com',
        password: 'test-pwd',
        name: 'test-name',
      };

      const updateTaskDto: UpdateTaskDto = {
        id: 1,
        title: 'New Task Title',
        description: 'New Description',
        status: 'New Status',
        user: 2, // User ID
      };

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(taskEntity); // Mock the findOne method (old entity)
      taskEntity.title = updateTaskDto.title;
      jest.spyOn(taskRepository, 'save').mockResolvedValue(taskEntity); // Mock the save method (new entity updated)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null); // Mock the userRepository to return null, as user not found

      // Act
      const result: FindTaskDto = await tasksService.update(
        userId,
        taskId,
        updateTaskDto,
      );

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: taskId,
          title: 'New Task Title',
        }),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      }); // Verify that the findOne method was called with the correct options
      expect(taskRepository.save).toHaveBeenCalledWith(expect.any(Task)); // Verify that the save method was called with a Task entity
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateTaskDto.user },
      }); // Verify that the userRepository was called to find the user
    });
    it('should throw CustomException when a task with the given ID does not exist', async () => {
      const userId = 2;
      const taskId = 1;
      const updateTaskDto: UpdateTaskDto = {
        id: 1,
        title: 'New Task Title',
        description: 'New Description',
        status: 'New Status',
        user: 2, // User ID
      };

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null); // Mock the findOne method to return null

      // Act and Assert
      await expect(
        tasksService.update(userId, taskId, updateTaskDto),
      ).rejects.toThrowError(
        new CustomException(`Task not found with id ${taskId}`, 404),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      }); // Verify that the findOne method was called with the correct options
    });
    it('should throw an exception when user is not authorized to update the task', async () => {
      const userId = 1;
      const taskId = 1;
      const taskDTO = {
        id: 1,
        title: 'Updated Title',
        status: 'DONE',
        description: 'Updated Description',
        user: 2,
      };

      // Mock the taskRepository.findOne to return a task with a different user ID
      jest.spyOn(taskRepository, 'findOne').mockResolvedValueOnce({
        id: taskId,
        title: 'Old Title',
        status: 'TO_DO',
        description: 'Old Description',
        user: { id: 2 },
      } as Task);

      await expect(
        tasksService.update(userId, taskId, taskDTO),
      ).rejects.toThrowError(
        new CustomException('You are not authorized to update this task', 403),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      });
    });
  });

  describe('remove', () => {
    it('should remove a task and return true when a task with the given ID exists', async () => {
      const userId = 2;
      const taskId = 1;
      const taskEntity = new Task(); // Create a Task entity
      taskEntity.id = taskId;
      taskEntity.user = {
        id: 2,
        email: 'test-email@domain.com',
        password: 'test-pwd',
        name: 'test-name',
      };

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(taskEntity); // Mock the findOne method
      jest.spyOn(taskRepository, 'remove').mockResolvedValue(taskEntity); // Mock the remove method

      // Act
      const result: boolean = await tasksService.remove(taskId, userId);

      // Assert
      expect(result).toBe(true); // Verify that the result is true when the task is successfully removed
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      }); // Verify that the findOne method was called with the correct options
      expect(taskRepository.remove).toHaveBeenCalledWith(taskEntity); // Verify that the remove method was called with the task entity
    });

    it('should throw CustomException when a task with the given ID does not exist', async () => {
      const taskId = 1;
      const userId = 2;

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null); // Mock the findOne method to return null

      // Act and Assert
      await expect(tasksService.remove(taskId, userId)).rejects.toThrowError(
        new CustomException(`Task not found with id ${taskId}`, 404),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      }); // Verify that the findOne method was called with the correct options
    });
    it('should throw an exception when user is not authorized to delete the task', async () => {
      const taskId = 1;
      const userId = 1;

      // Mock the taskRepository.findOne to return a task with a different user ID
      jest.spyOn(taskRepository, 'findOne').mockResolvedValueOnce({
        id: taskId,
        user: { id: 2 }, // Different user ID
      } as Task);

      await expect(tasksService.remove(taskId, userId)).rejects.toThrowError(
        new CustomException('You are not authorized to delete this task', 403),
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['user'],
      });
    });
  });
});
