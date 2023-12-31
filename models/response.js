import { sequelize, Response, Chapter, ResponseChapters, ResponseDemographics } from "./sequelize.js";

export default {
    getAll: async function () {
        let data = []
        const responses = await Response.findAll()
        for (const response of responses) {
            const findPattern = { where: {
                ResponseId: response.getDataValue('id')
            }}

            data.push({
                response,
                responseChapters: await ResponseChapters.findAll(findPattern),
                responseDemographics: await ResponseDemographics.findAll(findPattern)
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
            const findPattern = { where: {
                    ResponseId: response.getDataValue('id')
            }}

            return {
                success: true,
                data: {
                    response,
                    responseChapters: await ResponseChapters.findAll(findPattern),
                    responseDemographics: await ResponseDemographics.findAll(findPattern)
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
        const response = await Response.findOne({where: { code }})

        if (!response) {
            return {
                success: false,
                error: "No response with that code found."
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
            const [responseChapter, _] = await ResponseChapters.findOrCreate({ 
                where: {
                    ResponseId: response.getDataValue('id'),
                    ChapterId: item.ChapterId
                },
                defaults: data
            })

            try {
                responseChapter.set(data)
                await responseChapter.save()
            } catch(error) {
                console.log(error)
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

    setDemographicData: async function (code, responseDemographicsData) {
        const response = await Response.findOne({where: { code }})

        if (!response) {
            return {
                success: false,
                error: "No response with that code found."
            }
        }

        // only pending results can be changed, return if not pending
        if (!response.pending) {
            return {
                success: false,
                error: "Cannot change committed responses."
            }
        }

        try {
            for (const responseDemographic of responseDemographicsData) {
                ResponseDemographics.create({
                    ResponseId: response.getDataValue('id'),
                    ...responseDemographic
                })
            }
        } catch(error) {
            console.error(error)
            return {
                success: false,
                error
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
