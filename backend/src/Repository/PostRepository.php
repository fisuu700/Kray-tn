<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Post>
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    public function findByFilters(?string $type, ?string $category, ?string $city): array
    {
        $qb = $this->createQueryBuilder('p');

        if ($type) {
            $qb->andWhere('p.type = :type')->setParameter('type', $type);
        }
        if ($category) {
            $qb->andWhere('p.category = :category')->setParameter('category', $category);
        }
        if ($city) {
            $qb->andWhere('p.location LIKE :city')->setParameter('city', '%' . $city . '%');
        }

        return $qb->orderBy('p.id', 'DESC')
                  ->getQuery()
                  ->getResult();
    }
}
