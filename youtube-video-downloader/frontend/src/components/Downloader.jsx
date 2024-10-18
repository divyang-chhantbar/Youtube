export default function Downloader() {
    const[url , setUrl] = useState('');
    const[quality , setQuality] = useState("1080p");

    const handleDownload = () => {
        console.log("Downloading...",url , "Quality: ", quality);
    }
}