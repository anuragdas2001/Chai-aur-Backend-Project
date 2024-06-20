import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, //cloudinary
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, //cloudinary
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublised: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
VideoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", VideoSchema);
