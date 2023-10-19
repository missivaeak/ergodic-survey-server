import { sequelize, Response, Chapter, ResponseChapters } from "./sequelize.js";

export default {
    getAll: async function () {
        try {
            return {
                success: true,
                data: await Response.findAll({include: Chapter})
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
    },

    setChapterData: async function (responseChaptersData) {
        const code = responseChaptersData.code
        let response, _

        try {
            [response, _] = await Response.findOrCreate({
                where: { code },
                defaults: { code, pending: true }
            })
        } catch(error) {
            return {
                success: false,
                error
            }
        }

        // only pending results can be changed, return if not pending
        if (!response.pending) {
            return {
                success: false,
                message: "Cannot change committed responses."
            }
        }

        for (const chapter of responseChaptersData.chaptersData) {
            const data = {
                ResponseId: response.id,
                ...chapter
            }
            let responseChapter = await ResponseChapters.findOne({ where: {
                ResponseId: response.id,
                ChapterId: chapter.ChapterId
            }})

            try {
                if (responseChapter) {
                    responseChapter.set(data)
                    await responseChapter.save()
                } else {
                    responseChapter = await ResponseChapters.create(data)
                }
            } catch(error) {
                return {
                    success: false,
                    error
                }
            }
        }

        return {
            success: true,
            data: {
                ...response.toJSON(),
                responseChapters: await response.getChapters()
            }
        }
    }
}