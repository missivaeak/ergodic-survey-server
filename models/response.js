import { sequelize, Response, Chapter, ResponseChapters } from "./sequelize.js";

export default {
    getAll: async function () {
        let data = []
        const responses = await Response.findAll()
        for (const response of responses) {
            data.push({
                response,
                responseChapters: await ResponseChapters.findAll({where: {
                    ResponseId: response.getDataValue('id')
                }})
            })
        }
        try {
            return {
                success: true,
                data
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
    },

    getOne: async function (code) {
        try {
            const response = await Response.findOne({where: { code }})
            return {
                success: true,
                data: {
                    response,
                    responseChapters: await ResponseChapters.findAll({
                        where: {
                            ResponseId: response.getDataValue('id')
                        }
                    })
                }
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
    },

    setChapterData: async function (code, responseChaptersData) {
        let response

        try {
            response = await Response.find({where: { code }})
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

        for (const item of responseChaptersData) {
            const data = {
                ResponseId: response.getDataValue('id'),
                ChapterId: item.ChapterId,
                viewed: item.viewed,
                checked: item.checked,
                time: item.time
            }
            const responseChapter = await ResponseChapters.findOrCreate({ 
                where: {
                    ResponseId: response.getDataValue('id'),
                    ChapterId: chapter.ChapterId
                },
                defaults: data
            })

            try {
                responseChapter.set(data)
                await responseChapter.save()
            } catch(error) {
                return {
                    success: false,
                    error
                }
            }
        }

        return {
            success: true
        }
    },

    getAvailableCode: async function() {
        let code;
        let response;

        try {
            while (true) {
                code = Math.floor(Math.random() * 100000000);
                code = ('00000000' + code).slice(-8)

                const find = await Response.findOne({ 
                    where: { code }
                })

                if (!find) {
                    response = await Response.create({ code, pending: true })
                    break
                }
            }

            await populateResponseChapters(response)

            return {
                success: true,
                data: await Response.findByPk(response.getDataValue('id'))
            }
        } catch(error) {
            console.log(error)
            return {
                success: false,
                error
            }
        }
    }
}

async function populateResponseChapters(response) {
    try {
        const chapters = await Chapter.findAll()
        for (const chapter of chapters) {
            ResponseChapters.create({
                ResponseId: response.getDataValue('id'),
                ChapterId: chapter.id,
                viewed: false,
                checked: false,
                time: 0
            })
        }
    } catch(error) {
        console.log(error)
    }
}
