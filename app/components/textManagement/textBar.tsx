
export default function TextCard({ text }: { text: string }) {
    return (
        <div className="card px-20 bg-base-100">
            <div className="card-body">
                <p className="text-base">{text}</p>
            </div>
        </div>
    );
}