import { sequelize, Demographic } from "./sequelize.js";

export default {
    getAll: async function () {
        try {
            const data = await Demographic.findAll()

            for (const item of data) {
                if (item.questionAlternatives.length === 0) {
                    item.questionAlternatives = [];
                    continue;
                }

                item.questionAlternatives = item.questionAlternatives.split(',')
            }

            // console.log(data)

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

    add: async function (demographicData) {
        const question = demographicData.question;
        const description = demographicData.description;
        const type = demographicData.type;
        const label = demographicData.label;
        const questionAlternatives = demographicData.questionAlternatives;
        const questionAlternativesString = Array.isArray(questionAlternatives) ? questionAlternatives.join() : "";

        try {
            return {
                success: true,
                data: await Demographic.create({ question, description, type, label, questionAlternatives: questionAlternativesString })
            }
        } catch(error) {
            return {
                success: false,
                error
            }
        }
    }
}