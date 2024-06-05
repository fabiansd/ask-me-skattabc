'use client'
import { useState } from "react";
import { UserFeedbackInput } from "../interface/feedback";

const initialFeedback: UserFeedbackInput = {
    happiness_feedback: '',
    desired_features: '',
}

export default function Feedback() {

    const [feedback, setFeedback] = useState(initialFeedback);
    const [isLoading, setIsLoading] = useState(false);

    const handeButtonClick = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/postgres/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback: feedback }),
            });
            if (!response.ok) {
                throw new Error('Failed to add feedback');
            }
            await response.json();
            setFeedback(initialFeedback);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
        setIsLoading(false);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handeButtonClick();
        }
    };
    
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = event.target;
        setFeedback({
            ...feedback,
            [name]: value,
        });
    };

    return (     
        <div className="pt-10 flex justify-center">
            <div className="w-full max-w-2xl space-y-4">
                <textarea
                    name="happiness_feedback"
                    value={feedback.happiness_feedback}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="textarea textarea-bordered w-full h-40 p-4"
                    placeholder="Positive og negative tilbakemeldinger om skattGPT"
                ></textarea>
                <textarea
                    name="desired_features"
                    value={feedback.desired_features}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="textarea textarea-bordered w-full h-40 p-4"
                    placeholder="Ting du skulle ønske skattGPT kunne"
                ></textarea>
                <div className="flex justify-center">
                    <button
                        className="btn bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 rounded"
                        disabled={isLoading || (feedback.desired_features === '' && feedback.happiness_feedback === '')}
                        onClick={handeButtonClick}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}