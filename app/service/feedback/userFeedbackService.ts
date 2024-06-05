import { addUserFeedback } from "@/app/consumers/postgresConsumer";
import { UserFeedbackInput } from "@/app/interface/feedback";


async function addUserFeedbackService(feedback: UserFeedbackInput) {

    return await addUserFeedback(feedback);
}

export default addUserFeedbackService;