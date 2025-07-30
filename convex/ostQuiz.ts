// "use node";

// import { action } from "./_generated/server";
// import { v } from "convex/values";
// import { api } from "./_generated/api";
// import {
//     generateOstQuizArgs,
//     generateOstQuizReturns,
// } from "./ostQuizTypes";
// import { shikiAPI, ShikiAPIAnimeSearch } from "./shikiAPI";

// // Вспомогательные функции
// function shuffleArray<T>(array: T[]): T[] {
//     const newArray = [...array];
//     for (let i = newArray.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
//     }
//     return newArray;
// }

// // Генерация OST квиза
// export const generateOstQuiz = action({
//     args: generateOstQuizArgs,
//     returns: generateOstQuizReturns,
//     handler: async (ctx, args) => {
//         const questions: any[] = [];
//         const usedAnimeIds = new Set<number>();
//         let attempts = 0;
//         const maxAttempts = 5;

//         // Вычисляем количество существующих и новых вопросов
//         const existingQuestionsCount = Math.floor(args.questionCount * 0.8); // 80%
//         const newQuestionsCount = args.questionCount - existingQuestionsCount; // 20%

//         // Сначала пытаемся найти существующие вопросы
//         if (existingQuestionsCount > 0) {
//             const existingQuestions = await ctx.runQuery(api.ostQuizMutations.findExistingQuestions, {
//                 limit: existingQuestionsCount * 2, // Берем больше, чтобы было из чего выбирать
//             });

//             // Выбираем случайные существующие вопросы
//             const shuffledExisting = shuffleArray(existingQuestions);
//             for (const question of shuffledExisting) {
//                 if (questions.length >= existingQuestionsCount) break;

//                 // Проверяем, что аниме не использовалось
//                 if (!usedAnimeIds.has((question as any).animeId)) {
//                     questions.push({
//                         ...(question as any),
//                         order: questions.length,
//                     });
//                     usedAnimeIds.add((question as any).animeId);
//                 }
//             }
//         }

//         // Генерируем новые вопросы, если нужно
//         while (questions.length < args.questionCount && attempts < maxAttempts) {
//             attempts++;

//             // Получаем случайные аниме
//             const randomAnimes = await shikiAPI.getRandomAnime(newQuestionsCount * 3);
//             const validAnimes = randomAnimes.filter(anime =>
//                 anime && anime.id && anime.name && anime.russian &&
//                 !usedAnimeIds.has(anime.id)
//             );

//             for (const anime of validAnimes) {
//                 if (questions.length >= args.questionCount) break;

//                 try {
//                     // Получаем World-Art ID
//                     const worldArtId = await shikiAPI.getWorldArtId(anime.id);
//                     if (!worldArtId) continue;

//                     // Парсим World-Art
//                     const osts = await ctx.runAction(api.worldArt.parseWorldArt, { waId: worldArtId });

//                     // Фильтруем только OP и ED
//                     const filteredOsts = osts.filter((ost: any) =>
//                         ost.type === "OP" || ost.type === "ED"
//                     );

//                     if (filteredOsts.length > 0) {
//                         // Получаем варианты ответов
//                         const wrongOptions = await shikiAPI.getRandomAnime(3);
//                         const validWrongOptions = wrongOptions.filter(a =>
//                             a && a.id && a.name && a.russian &&
//                             a.id !== anime.id && !usedAnimeIds.has(a.id)
//                         );

//                         if (validWrongOptions.length >= 3) {
//                             const correctOption = {
//                                 id: anime.id,
//                                 name: anime.name.trim(),
//                                 russian: anime.russian.trim()
//                             };

//                             const allOptions = shuffleArray([
//                                 correctOption,
//                                 ...validWrongOptions.slice(0, 3).map(a => ({
//                                     id: a.id,
//                                     name: a.name.trim(),
//                                     russian: a.russian.trim()
//                                 }))
//                             ]);

//                             const correctAnswerIndex = allOptions.findIndex(opt => opt.id === anime.id);
//                             const randomOst = filteredOsts[Math.floor(Math.random() * filteredOsts.length)];

//                             // Создаем вопрос
//                             const questionId: any = await ctx.runMutation(api.ostQuizMutations.createOstQuestion, {
//                                 ostUrl: randomOst.videoUrl || `http://www.world-art.ru${randomOst.video}`,
//                                 ostType: randomOst.type,
//                                 correctAnswer: anime.id,
//                                 options: allOptions,
//                                 animeId: anime.id,
//                                 worldArtId: worldArtId,
//                                 metadata: {
//                                     generatedAt: Date.now(),
//                                     source: "generated",
//                                 },
//                             });

//                             questions.push({
//                                 _id: questionId,
//                                 ostUrl: randomOst.videoUrl || `http://www.world-art.ru${randomOst.video}`,
//                                 ostType: randomOst.type,
//                                 correctAnswer: correctAnswerIndex,
//                                 options: allOptions,
//                                 order: questions.length,
//                                 animeId: anime.id,
//                                 usageCount: 0,
//                             });

//                             usedAnimeIds.add(anime.id);
//                             validWrongOptions.slice(0, 3).forEach(opt => usedAnimeIds.add(opt.id));
//                         }
//                     }
//                 } catch (error) {
//                     console.error("Error generating question for anime:", anime.id, error);
//                 }
//             }
//         }

//         if (questions.length < args.questionCount) {
//             throw new Error(`Could not generate ${args.questionCount} questions. Only got ${questions.length} valid questions.`);
//         }

//         // Создаем квиз
//         const quizId: any = await ctx.runMutation(api.ostQuizMutations.createOstQuiz, {
//             title: args.title || "Anime OST Quiz",
//             description: args.description,
//             questionCount: args.questionCount,
//             difficulty: args.difficulty,
//             isPublic: true,
//             createdBy: undefined, // TODO: добавить пользователя
//             tags: args.tags || [],
//             metadata: {
//                 generatedAt: Date.now(),
//                 strategy: "80_existing_20_new",
//             },
//         });

//         // Связываем вопросы с квизом
//         for (let i = 0; i < questions.length; i++) {
//             await ctx.runMutation(api.ostQuizMutations.linkQuestionToQuiz, {
//                 quizId: quizId,
//                 questionId: questions[i]._id,
//                 order: i,
//             });
//         }

//         return {
//             quizId: quizId,
//             title: args.title || "Anime OST Quiz",
//             questionCount: args.questionCount,
//             questions: questions,
//         };
//     },
// }); 