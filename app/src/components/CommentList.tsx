import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

interface CommentListProps {
  logId: number;
}

export function CommentList({ logId }: CommentListProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const { data: comments, refetch } = trpc.comment.list.useQuery(
    { logId },
    { enabled: showComments }
  );

  const createComment = trpc.comment.create.useMutation({
    onSuccess: () => {
      toast.success("评论已发布");
      setNewComment("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteComment = trpc.comment.delete.useMutation({
    onSuccess: () => {
      toast.success("评论已删除");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment.mutate({ logId, content: newComment.trim() });
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1abc9c] transition-colors cursor-pointer bg-transparent border-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {comments?.length ?? 0} 条评论
        <svg
          className={`w-3 h-3 transition-transform ${showComments ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Comment form */}
          {user && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1abc9c]"
              />
              <button
                type="submit"
                disabled={createComment.isPending || !newComment.trim()}
                className="px-4 py-2 bg-[#1abc9c] text-white text-xs rounded-lg hover:bg-[#16a085] cursor-pointer disabled:opacity-50"
              >
                {createComment.isPending ? "..." : "发布"}
              </button>
            </form>
          )}

          {/* Comments list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#1abc9c]/10 flex items-center justify-center text-[#1abc9c] text-xs font-bold flex-shrink-0">
                    {(comment.userName || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">{comment.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                  {user && comment.userId === user.id && (
                    <button
                      onClick={() => {
                        if (confirm("确定要删除这条评论吗？")) {
                          deleteComment.mutate({ id: comment.id });
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 cursor-pointer bg-transparent border-none flex-shrink-0"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">暂无评论，来说点什么吧</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
