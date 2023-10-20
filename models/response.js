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
                error: "Cannot change committed responses."
            }
        }

        for (const chapter of responseChaptersData.chaptersData) {
            const data = {
                ResponseId: response.getDataValue('id'),
                ...chapter
            }
            let responseChapter = await ResponseChapters.find({ 
                where: {
                    ResponseId: response.getDataValue('id'),
                    ChapterId: chapter.ChapterId
                }
            })

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

        // console.log(await response.getChapters({include: Chapter}))

        return {
            success: true,
            // data: {
            //     ...response.toJSON(),
            //     responseChapters: await response.getChapters()
            // }
            data: await Response.findOne({where: { code }, include: Chapter})
        }
    },

    getAvailableCode: async function() {
        let code;
        let response;

        try {
            while (true) {
                code = Math.floor(Math.random() * 100000000);
                code = ('00000000' + code).slice(-8)

                const find = await Response.findAll({ where: { code } })

                if (find.length === 0) {
                    response = await Response.create({ code, pending: true })
                    break
                }
            }

            return {
                success: true,
                data: response
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
    }
}