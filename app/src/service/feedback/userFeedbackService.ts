import { addUserFeedback } from "@/app/src/consumers/postgresConsumer";
import { UserFeedbackInput } from "@/app/src/interface/feedback";


async function addUserFeedbackService(feedback: UserFeedbackInput) {

    return await addUserFeedback(feedback);
}

export default addUserFeedbackService;