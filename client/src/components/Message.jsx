import React, { useEffect } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";

const Message = ({ message }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div className="w-full">
      {message.role.toLowerCase() === "user" ? (
        <div className="flex w-full justify-end my-4 gap-2">
          <div className="inline-flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl">
            <p className="text-sm dark:text-primary text-slate-900 reset-tw">
              {message.content}
            </p>

            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>

          <img
            src={assets.user_icon}
            className="w-8 h-8 rounded-full"
            alt="User"
          />
        </div>
      ) : (
        <div className="flex w-full justify-start my-4">
          <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C] border border-[#80609F]/30 rounded-md">
            {message.isImage ? (
              <img
                src={message.content}
                alt="Generated"
                className="max-w-md w-full mt-2 rounded-md"
              />
            ) : (
              <div className="text-sm dark:text-primary text-slate-900 reset-tw">
                <Markdown>{message.content}</Markdown>
              </div>
            )}

            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;