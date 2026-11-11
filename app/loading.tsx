import './styles/loading/loading.css'

export default function Loading() {
    return (
        <div className="loading-overlay">
            <div className="glass-container">
                <div className="water">
                    <div className="wave"></div>
                </div>
            </div>
        </div>
    )
}