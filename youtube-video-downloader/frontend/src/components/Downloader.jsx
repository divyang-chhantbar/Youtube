import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function Downloader() {

    const {register , handleSubmit , formState: {errors} } = useForm();
    const [isLoading , setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/download", {
                url: data.url,
                quality: data.quality
            });
    
            if (response.status === 200) {
                // Trigger the download of the video here
                const blob = new Blob([response.data], { type: 'video/mp4' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'video.mp4'; // You can change the file name
                document.body.appendChild(a); // Append the link to the body
                a.click(); // Simulate the download
                a.remove(); // Remove the link after download
    
                setIsLoading(false);
            } else {
                console.log("Failed to download video");
            }
        } catch (error) {
            console.error("Failed to download video", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h2>Download YouTube Video</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>URL :  </label>
                    <input
                        {...register('url', { required: true })}
                        placeholder="Enter YouTube URL"
                    />
                    {errors.url && <p>URL is required</p>}
                </div>

                <div>
                    <label>Quality:</label>
                    <select {...register('quality')}>
                        <option value="144p">144p</option>
                        <option value="240p">240p</option>
                        <option value="360p">360p</option>
                        <option value="480p">480p</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="1440p">1440p</option>
                        <option value="2160p">2160p</option>
                    </select>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Downloading...' : 'Download'}
                </button>
            </form>
        </div>
    );
}