import "./UploadedFileListViewStyle.css"

interface UploadedFileListViewProps {
    files: File[];
}

const UploadedFileListView = ({ files }: UploadedFileListViewProps) => {
    files.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="UploadedFileListView">
        {files.length > 0 && (
            <ul>
            {files.map((file, index) => (
                <li 
                key={`${file.name}-${file.size}-${index}`}
                data-type={
                    file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' :
                    file.type.startsWith('audio/') ? 'audio' :
                    file.name.endsWith('.pdf') ? 'pdf' :
                    file.name.match(/\.(doc|docx|txt)$/i) ? 'document' :
                    file.name.match(/\.(zip|rar|7z)$/i) ? 'archive' :
                    'file'
                }
                >
                <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} МБ</div>
                </div>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
};
export default UploadedFileListView;