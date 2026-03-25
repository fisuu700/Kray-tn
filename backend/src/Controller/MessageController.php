<?php

namespace App\Controller;

use App\Entity\Message;
use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/messages', name: 'api_messages_')]
class MessageController extends AbstractController
{
    // GET /api/conversations - list all conversations for current user
    #[Route('/conversations', name: 'inbox', methods: ['GET'])]
    public function inbox(Request $request, MessageRepository $messageRepository): JsonResponse
    {
        $myId = (int) $request->headers->get('X-User-Id');
        if (!$myId) {
            return $this->json(['message' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $conversations = $messageRepository->findConversationsForUser($myId);

        $data = array_map(function($msg) use ($myId) {
            $other = $msg->getSender()->getId() === $myId ? $msg->getReceiver() : $msg->getSender();
            return [
                'postId'       => $msg->getPost()->getId(),
                'postTitle'    => $msg->getPost()->getTitle(),
                'otherId'      => $other->getId(),
                'otherName'    => $other->getFullName(),
                'otherAvatar'  => $other->getAvatar(),
                'lastMessage'  => $msg->getContent(),
                'lastTime'     => $msg->getCreatedAt()?->format('H:i'),
                'isMine'       => $msg->getSender()->getId() === $myId,
            ];
        }, $conversations);

        return $this->json(['data' => $data]);
    }

    // GET /api/messages/{postId}/{ownerId} - fetch conversation
    #[Route('/{postId}/{ownerId}', name: 'conversation', methods: ['GET'])]
    public function getConversation(int $postId, int $ownerId, Request $request, MessageRepository $messageRepository, EntityManagerInterface $em): JsonResponse
    {
        $myId = (int) $request->headers->get('X-User-Id');
        if (!$myId) {
            return $this->json(['message' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $messages = $messageRepository->findConversation($postId, $myId, $ownerId);

        $data = array_map(fn(Message $m) => [
            'id' => $m->getId(),
            'content' => $m->getContent(),
            'senderId' => $m->getSender()->getId(),
            'senderName' => $m->getSender()->getFullName(),
            'senderAvatar' => $m->getSender()->getAvatar(),
            'createdAt' => $m->getCreatedAt()?->format('H:i'),
        ], $messages);

        return $this->json(['data' => $data]);
    }

    // POST /api/messages/{postId}/{receiverId} - send a message
    #[Route('/{postId}/{receiverId}', name: 'send', methods: ['POST'])]
    public function send(int $postId, int $receiverId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $myId = (int) $request->headers->get('X-User-Id');
        if (!$myId) {
            return $this->json(['message' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $content = trim($data['content'] ?? '');

        if (!$content) {
            return $this->json(['message' => 'Message cannot be empty'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $sender = $em->getRepository(\App\Entity\User::class)->find($myId);
        $receiver = $em->getRepository(\App\Entity\User::class)->find($receiverId);
        $post = $em->getRepository(\App\Entity\Post::class)->find($postId);

        if (!$sender || !$receiver || !$post) {
            return $this->json(['message' => 'Invalid data'], JsonResponse::HTTP_NOT_FOUND);
        }

        $message = new Message();
        $message->setSender($sender);
        $message->setReceiver($receiver);
        $message->setPost($post);
        $message->setContent($content);

        $em->persist($message);
        $em->flush();

        return $this->json([
            'id' => $message->getId(),
            'content' => $message->getContent(),
            'senderId' => $sender->getId(),
            'senderName' => $sender->getFullName(),
            'senderAvatar' => $sender->getAvatar(),
            'createdAt' => $message->getCreatedAt()?->format('H:i'),
        ], JsonResponse::HTTP_CREATED);
    }
}
