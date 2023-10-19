import { sequelize, Chapter } from "./sequelize.js";

export default {
    getAll: async function () {
        try {
            return {
                success: true,
                data: await Chapter.findAll()
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
        
    },

    add: async function (chapterData) {
        const title = chapterData.title;
        const content = chapterData.content;

        try {
            return {
                success: true,
                data: await Chapter.create({ title, content })
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
    }
}