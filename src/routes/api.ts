import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { UserModel } from '../models/UserModel';
import { PromptModel } from '../models/PromtModel';
import { ChatModel } from '../models/ChatModel';
import { MessageModel } from '../models/MessageModel';
import { DimaModel } from '../models/DIimash';
import { DeviceDataModel } from '../models/3dModels';
import { ComponentModel } from '../models/ComponentModel';
import { Types } from 'mongoose';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Интерфейсы для внешнего API
interface ExternalApiResponse {
  image_id: string;
  object_name: string;
  description_of_item: string;
  components: Array<{
    name_of_component: string;
    description_of_component: string;
    object_model: string;
    status: string;
    error: string | null;
  }>;
}

// interface ExternalChatApiResponse {
//   message: string;
// }

// Middleware для получения или создания пользователя по IP
const getUserByIp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

  if (!userIp) {
    res.status(400).json({ error: 'Не удалось определить IP-адрес пользователя' });
    return;
  }

  let user = await UserModel.findOne({ ipAddress: userIp });

  if (!user) {
    user = new UserModel({ ipAddress: userIp });
    await user.save();
  }

  // Прикрепляем пользователя к запросу
  (req as any).user = user;
  next();
};

// Маршрут для загрузки промпта и/или фото
router.post('/upload', upload.single('photo'), getUserByIp, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { prompt } = req.body;
    const photo = req.file;

    if (!prompt && !photo) {
      res.status(400).json({ error: 'Необходимо отправить промпт или фото' });
      return;
    }


   // Отправка данных на внешний API и получение ответа
    // let apiResponseData: ExternalApiResponse | null = null;

    // if (prompt || photo) {
    // const externalApiUrl = process.env.EXTERNAL_API_URL as string;
    // const formData = new FormData();

    // if (prompt) formData.append('prompt', prompt);
    // if (photo) {
    //     formData.append('photo', photo.buffer, {
    //     filename: photo.originalname,
    //     contentType: photo.mimetype,
    //     });
    // }

    // const apiResponse = await axios.post<ExternalApiResponse>(externalApiUrl, formData, {
    //     headers: formData.getHeaders(),
    // });

    // apiResponseData = apiResponse.data;
    // }

   // Временные фейковые данные вместо внешнего API
    const apiResponseData: ExternalApiResponse = {
        image_id: "5a53d770-0a00-4d31-92b9-d54688777db8",
        object_name: "Монитор",
        description_of_item: "Устройство для отображения графической информации и видео.",
        components: [
        {
            name_of_component: "Экран",
            description_of_component: "Плоская поверхность, на которой отображается изображение.",
            object_model: "https://nfactify.s3.amazonaws.com/user_3dmodel_1.obj",
            status: "in progress",
            error: null,
        },
        {
            name_of_component: "Подставка",
            description_of_component: "Устройство для устойчивости монитора.",
            object_model: "https://nfactify.s3.amazonaws.com/user_3dmodel_2.obj",
            status: "in progress",
            error: null,
        }
        ]
    };
    
    if (!apiResponseData) {
      res.status(500).json({ error: 'Отсутствует ответ от внешнего API' });
      return;
    }

    const { image_id, object_name, description_of_item, components } = apiResponseData;

    // Создание записи в Dima
    const dimaEntry = new DimaModel({
      s3Urls: components.map(component => component.object_model),
      textResponce: description_of_item,
      components: [],
    });
    await dimaEntry.save();
    // let flag:Boolean = false
    if (prompt) {
        const newPrompt = new PromptModel({
          user: user._id,
          promptText: prompt,
          s3Urls: components.map(component => component.object_model),
          textResponce: description_of_item,
          ts: [],
        });
      
        user.prompts.push(newPrompt._id);
      
        // Проходим по каждому компоненту из внешнего API и сохраняем его
        for (const comp of components) {
          const component = new ComponentModel({
            name_of_component: comp.name_of_component,
            description_of_component: comp.description_of_component,
            object_model: comp.object_model,
            status: comp.status,
            error: comp.error,
          });
      
          // Сохраняем компонент в базе данных
          await component.save();
      
          // Добавляем компонент в DimaModel и в PromptModel
          dimaEntry.components.push(component._id);
          newPrompt.ts.push({
            name_of_component: comp.name_of_component,
            description_of_component: comp.description_of_component,
            object_model: comp.object_model,
            status: comp.status,
            error: comp.error,
          });
        }
      
        // Сохраняем изменения в DimaModel и PromptModel
        await dimaEntry.save();
        await newPrompt.save();
        await user.save(); // Не забываем сохранять пользователя после добавления промпта
      }
      
       // Сохранение промпта
    // Создание компонентов и добавление их в Dima
   

    // Создание записи в DeviceData
    const deviceData = new DeviceDataModel({
      deviceId: user.ipAddress, // Или другой уникальный идентификатор устройства
      dimaRef: dimaEntry._id,
    });
    await deviceData.save();

    // Создание чатов для каждой полученной картинки
    const chatIds: Types.ObjectId[] = [];
    for (const url of dimaEntry.s3Urls) {
      const chat = new ChatModel({
        user: user._id,
        imageUrl: url,
      });
      await chat.save();
      user.chats.push(chat._id);
      chatIds.push(chat._id as Types.ObjectId);
    }

    await user.save();

    res.json({
      success: true,
      data: {
        image_id,
        object_name,
        description_of_item,
        components,
        chatIds,
      },
    });
  } catch (error) {
    console.error('Ошибка в /upload:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Маршрут для общения с выбранной картинкой
// router.post('/talk3D', getUserByIp, async (req: Request, res: Response): Promise<void> => {
//   try {
//     const user = (req as any).user;
//     const { chatId, messageContent } = req.body;

//     if (!chatId || !messageContent) {
//       res.status(400).json({ error: 'Необходимо передать chatId и messageContent' });
//       return;
//     }

//     // Найти чат
//     const chat = await ChatModel.findOne({ _id: chatId, user: user._id });
//     if (!chat) {
//       res.status(404).json({ error: 'Чат не найден' });
//       return;
//     }

//     // Создание сообщения от пользователя
//     const userMessage = new MessageModel({
//       chat: chat._id,
//       sender: 'user',
//       content: messageContent,
//     });
//     await userMessage.save();
//     chat.messages.push(userMessage._id as Types.ObjectId);

//     // Отправка сообщения на внешний API для получения ответа от бота
//     const externalChatApiUrl = process.env.EXTERNAL_CHAT_API_URL as string;
//     const apiResponse = await axios.post<ExternalChatApiResponse>(externalChatApiUrl, {
//       imageUrl: chat.imageUrl,
//       message: messageContent,
//     });

//     const botMessageContent = apiResponse.data.message;

//     // Создание сообщения от бота
//     const botMessage = new MessageModel({
//       chat: chat._id,
//       sender: 'bot',
//       content: botMessageContent,
//     });
//     await botMessage.save();
//     chat.messages.push(botMessage._id as Types.ObjectId);

//     await chat.save();

//     res.json({
//       success: true,
//       data: {
//         messages: [
//           { sender: 'user', content: userMessage.content, timestamp: userMessage.timestamp },
//           { sender: 'bot', content: botMessage.content, timestamp: botMessage.timestamp },
//         ],
//       },
//     });
//   } catch (error) {
//     console.error('Ошибка в /talk3D:', error);
//     res.status(500).json({ error: 'Внутренняя ошибка сервера' });
//   }
// });


// router.get('/chats', getUserByIp, async (req: Request, res: Response): Promise<void> => {
//   try {
//     const user = (req as any).user;
//     const chats = await ChatModel.find({ user: user._id }).populate('messages');
//     res.json({ success: true, data: chats });
//   } catch (error) {
//     console.error('Ошибка в /chats:', error);
//     res.status(500).json({ error: 'Внутренняя ошибка сервера' });
//   }
// });

// Маршрут для получения всех промптов пользователя
router.get('/prompts', getUserByIp, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const prompts = await PromptModel.find({ user: user._id });
    res.json({ success: true, data: prompts });
  } catch (error) {
    console.error('Ошибка в /prompts:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; // Убедитесь, что экспортируется только один раз

// router.post('/upload', upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { deviceId, prompt } = req.body;
//     const photo = req.file;

//     if (!deviceId) {
//        res.status(400).json({ error: 'Device ID обязателен' });
//     }

//     const formData = new FormData();
//     if (prompt) formData.append('prompt', prompt);
//     if (photo) {
//       formData.append('photo', photo.buffer, {
//         filename: photo.originalname,
//         contentType: photo.mimetype,
//       });
//     }
//     console.log(formData)
//     // const apiResponse = await axios.post(process.env.OTHER_API_URL as string, formData, {
//     //   headers: formData.getHeaders(),
//     // });

//     // const data = apiResponse.data as ApiResponse;
//     const s3Urls = ["era","era"];
//     const textResponce = "edd"
//     const dimaEntry = new DimaModel({
//       s3Urls,
//       textResponce
//     });

//     await dimaEntry.save();

//     const deviceData = new DeviceDataModel({
//       deviceId,
//       dimaRef: dimaEntry._id,
//     });

//     await deviceData.save();

//     res.json({
//       success: true,
//       data: deviceData,
//     });
//   } catch (error) {
//     console.error('Ошибка:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });


// router.get('/getip', async (req: Request, res: Response): Promise<void> =>  {
//     console.log("ers")
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     res.json({ ip: ip });
//         // Создаем новую интеракцию
//     const interaction = new InteractionModel({
//         userIp,
//     });

//     await interaction.save();

//     // Сохраняем ID интеракции в сессии или куки для последующих запросов
//     req.session.interactionId = interaction._id;

//     next();
//     console.log( res.json({ ip: ip }))
// });

