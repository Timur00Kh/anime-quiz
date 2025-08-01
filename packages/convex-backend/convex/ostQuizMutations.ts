// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";
// import { api } from "./_generated/api";
// import {
//     getOstQuizArgs,
//     getOstQuizReturns,
//     getRandomOstQuizArgs,
//     createOstQuestionArgs,
//     findExistingQuestionsArgs
// } from "./ostQuizTypes";

// // Создание отдельного вопроса
// export const createOstQuestion = mutation({
//     args: createOstQuestionArgs,
//     handler: async (ctx, args) => {
//         const questionId = await ctx.db.insert("ostQuestions", {
//             ostUrl: args.ostUrl,
//             ostType: args.ostType,
//             correctAnswer: args.correctAnswer,
//             options: args.options,
//             animeId: args.animeId,
//             worldArtId: args.worldArtId,
//             metadata: args.metadata,
//             isPublic: true,
//             usageCount: 0,
//         });

//         return questionId;
//     },
// });

// // Создание квиза
// export const createOstQuiz = mutation({
//     args: {
//         title: v.string(),
//         description: v.optional(v.string()),
//         questionCount: v.number(),
//         difficulty: v.optional(v.string()),
//         isPublic: v.boolean(),
//         createdBy: v.optional(v.string()),
//         tags: v.array(v.string()),
//         metadata: v.optional(v.any()),
//     },
//     handler: async (ctx, args) => {
//         const quizId = await ctx.db.insert("ostQuizzes", {
//             title: args.title,
//             description: args.description,
//             questionCount: args.questionCount,
//             difficulty: args.difficulty,
//             isPublic: args.isPublic,
//             createdBy: args.createdBy,
//             tags: args.tags,
//             metadata: args.metadata,
//         });

//         return quizId;
//     },
// });

// // Связывание вопроса с квизом
// export const linkQuestionToQuiz = mutation({
//     args: {
//         quizId: v.id("ostQuizzes"),
//         questionId: v.id("ostQuestions"),
//         order: v.number(),
//     },
//     handler: async (ctx, args) => {
//         await ctx.db.insert("ostQuizQuestions", {
//             quizId: args.quizId,
//             questionId: args.questionId,
//             order: args.order,
//         });

//         // Увеличиваем счетчик использования вопроса
//         const question = await ctx.db.get(args.questionId);
//         if (question) {
//             await ctx.db.patch(args.questionId, {
//                 usageCount: question.usageCount + 1,
//             });
//         }
//     },
// });

// // Поиск существующих вопросов
// export const findExistingQuestions = query({
//     args: findExistingQuestionsArgs,
//     handler: async (ctx, args) => {
//         let questions;

//         if (args.animeId !== undefined && args.ostType !== undefined) {
//             // Если есть оба параметра, используем один индекс и фильтруем второй
//             questions = await ctx.db
//                 .query("ostQuestions")
//                 .withIndex("by_anime_id", (q) => q.eq("animeId", args.animeId!))
//                 .filter((q) => q.eq(q.field("ostType"), args.ostType!))
//                 .collect();
//         } else if (args.animeId !== undefined) {
//             questions = await ctx.db
//                 .query("ostQuestions")
//                 .withIndex("by_anime_id", (q) => q.eq("animeId", args.animeId!))
//                 .collect();
//         } else if (args.ostType !== undefined) {
//             questions = await ctx.db
//                 .query("ostQuestions")
//                 .withIndex("by_ost_type", (q) => q.eq("ostType", args.ostType!))
//                 .collect();
//         } else {
//             questions = await ctx.db.query("ostQuestions").collect();
//         }

//         // Фильтруем по публичности и сортируем по использованию
//         const filteredQuestions = questions
//             .filter(q => q.isPublic)
//             .sort((a, b) => b.usageCount - a.usageCount);

//         return filteredQuestions.slice(0, args.limit || 10);
//     },
// });

// // Получение OST квиза по ID
// export const getOstQuiz = query({
//     args: getOstQuizArgs,
//     returns: getOstQuizReturns,
//     handler: async (ctx, args) => {
//         const quiz = await ctx.db.get(args.quizId);
//         if (!quiz) return null;

//         const questions = await ctx.db
//             .query("ostQuizQuestions")
//             .withIndex("by_quiz_id", (q) => q.eq("quizId", args.quizId))
//             .order("asc")
//             .collect();

//         const questionDetails = await Promise.all(
//             questions.map(async (link) => {
//                 const question = await ctx.db.get(link.questionId);
//                 return {
//                     ...question,
//                     order: link.order,
//                 };
//             })
//         );

//         return {
//             quiz,
//             questions: questionDetails.filter(q => q !== null),
//         };
//     },
// });

// // Получение случайного OST квиза
// export const getRandomOstQuiz = query({
//     args: getRandomOstQuizArgs,
//     returns: getOstQuizReturns,
//     handler: async (ctx, args) => {
//         let quizzes;

//         if (args.difficulty !== undefined) {
//             quizzes = await ctx.db
//                 .query("ostQuizzes")
//                 .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
//                 .filter((q) => q.eq(q.field("isPublic"), true))
//                 .collect();
//         } else {
//             quizzes = await ctx.db
//                 .query("ostQuizzes")
//                 .withIndex("by_public", (q) => q.eq("isPublic", true))
//                 .collect();
//         }

//         if (quizzes.length === 0) return null;

//         const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
//         return await ctx.runQuery(api.ostQuizMutations.getOstQuiz, {
//             quizId: randomQuiz._id,
//         });
//     },
// });

// // Сохранение результатов квиза
// export const saveQuizResults = mutation({
//     args: {
//         quizId: v.id("ostQuizzes"),
//         userId: v.optional(v.string()),
//         score: v.number(),
//         totalQuestions: v.number(),
//         completedAt: v.number(),
//         guessTimes: v.array(v.object({
//             questionIndex: v.number(),
//             timeLeft: v.optional(v.number()),
//             isCorrect: v.boolean(),
//         })),
//         telegramData: v.optional(v.object({
//             chatId: v.number(),
//             messageId: v.number(),
//         })),
//     },
//     handler: async (ctx, args) => {
//         const resultId = await ctx.db.insert("ostQuizResults", {
//             quizId: args.quizId,
//             userId: args.userId,
//             score: args.score,
//             totalQuestions: args.totalQuestions,
//             completedAt: args.completedAt,
//             guessTimes: args.guessTimes,
//             telegramData: args.telegramData,
//         });

//         return resultId;
//     },
// }); 