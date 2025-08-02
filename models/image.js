// Image schema and model
const ImageSchema = new Schema({
    url: {
        type: String, // Store the image URL
        required: [true, "Image URL is required"]
    },
    filename: {
        type: String, // Store the image filename (optional)
        required: false
    },
    uploadedAt: {
        type: Date, // Track when the image was uploaded
        default: Date.now
    }
}, { timestamps: true });

const Image = models.Image || model('Image', ImageSchema);
export default Image;
