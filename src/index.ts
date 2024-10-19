import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import apiRoutes from './routes/api';

const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статических файлов
app.use(express.static(path.join(__dirname, '../public')));

// Подключение маршрутов
app.use('/api', apiRoutes);



const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB as string;

// Подключение к MongoDB
mongoose
  .connect(mongoUrl)
  .then(() => console.log('MongoDB подключен'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

// // import { nodeJsByteUtils } from 'bson/src/utils/node_byte_utils';
// // import express, { Request, Response } from 'express';
// // import fs from 'fs';
// // import path from 'path';
// // import dotenv from 'dotenv'
// // import mongoose from 'mongoose';
// // import apiRoutes from './routes/api';

// // // Initialize environment variables
// // dotenv.config();
// // const app = express();
// // app.use(express.json());
// // app.use('/api', apiRoutes);
// // const port = process.env.PORT || 5000;
// // mongoose
// //   .connect(process.env.MONGODB as string)
// //   .then(() => console.log('MongoDB подключен'))
// //   .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

// //   // Маршрут для получения IP-адреса клиента

// // app.listen(port,() => {
// //     console.log(`Server is running on port ${port}`);
// // });
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import express from 'express';
// import path from 'path';
// import apiRoutes from './routes/api';

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Раздача статических файлов
// app.use(express.static(path.join(__dirname, '../public')));

// // Подключение маршрутов
// app.use('/api', apiRoutes);
// dotenv.config();

// const port = process.env.PORT || 5000;
// const mongoUrl = process.env.MONGODB as string;

// // Подключение к MongoDB
// mongoose
//   .connect(mongoUrl)
//   .then(() => console.log('MongoDB подключен'))
//   .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

// // Запуск сервера
// app.listen(port, () => {
//   console.log(`Сервер запущен на порту ${port}`);
// });

// export default app;
