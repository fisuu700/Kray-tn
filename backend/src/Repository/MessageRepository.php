<?php

namespace App\Repository;

use App\Entity\Message;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    public function findConversation(int $postId, int $userId1, int $userId2): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.post = :postId')
            ->andWhere(
                '(m.sender = :u1 AND m.receiver = :u2) OR (m.sender = :u2 AND m.receiver = :u1)'
            )
            ->setParameter('postId', $postId)
            ->setParameter('u1', $userId1)
            ->setParameter('u2', $userId2)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findConversationsForUser(int $userId): array
    {
        // Get the latest message per (post, otherUser) pair
        $all = $this->createQueryBuilder('m')
            ->where('m.sender = :uid OR m.receiver = :uid')
            ->setParameter('uid', $userId)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        $seen = [];
        $conversations = [];
        foreach ($all as $msg) {
            $otherId = $msg->getSender()->getId() === $userId
                ? $msg->getReceiver()->getId()
                : $msg->getSender()->getId();
            $key = $msg->getPost()->getId() . '_' . $otherId;
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $conversations[] = $msg;
            }
        }
        return $conversations;
    }
}
