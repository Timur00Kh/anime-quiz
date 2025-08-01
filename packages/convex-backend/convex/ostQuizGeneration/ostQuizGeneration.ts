import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";


// mutation
export const startQuizGeneration = mutation({
    args: {
        questionCount: v.number(),
    },
    handler: async (ctx, args) => {
        //  нужно создать задачу в бд
        const quizId = await ctx.db.insert("ostQuizzes", {
            questionCount: args.questionCount,
            status: "pending",
            createdAt: Date.now(),
            isPublic: true,
            tags: [],
            createdBy: "system",
            title: "Quiz",
            description: "Quiz",
        });

        // run internal mutation
        await ctx.scheduler.runAfter(0, internal.ostQuizGeneration.ostQuizGeneration.generateQuizQuestions, { quizId: quizId, questionCount: args.questionCount });

        return quizId;
    }
});

// action (background task)
export const generateQuizQuestions = internalMutation({
    args: { quizId: v.id("ostQuizzes"), questionCount: v.number() },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Get all public questions
        const allQuestions = await ctx.db
            .query("ostQuestions")
            .withIndex("by_public", (q) => q.eq("isPublic", true))
            .collect();

        // Shuffle and select random questions
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, args.questionCount);





        // Create quiz question relationships
        for (let i = 0; i < selectedQuestions.length; i++) {
            await ctx.db.insert("ostQuizQuestions", {
                quizId: args.quizId,
                questionId: selectedQuestions[i]._id,
                order: i,
            });
        }

        // Update quiz status to completed
        await ctx.db.patch(args.quizId, { status: "completed" });

        return null;
    }
});

// query для клиента
export const getQuizProgress = query({
    args: { quizId: v.id("ostQuizzes") },
    returns: v.any(),
    handler: async (ctx, args) => {
        // TODO: Implement quiz progress logic
        return null;
    }
});


export const generateOstQuiz = internalQuery({
    args: { questionCount: v.number() },
    returns: v.array(v.any()),
    handler: async (ctx, args) => {
        //  нужно получить в рандомном порядке вопросы из базы данных
        //  и вернуть их в случайном порядке
        const questions = await ctx.db.query("ostQuestions").collect();
        const randomQuestions = questions.sort(() => Math.random() - 0.5).slice(0, args.questionCount);
        return randomQuestions;
    }
})