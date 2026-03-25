<?php

namespace App\Controller;

use App\Entity\Post;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/posts', name: 'api_posts_')]
class PostController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function index(Request $request, PostRepository $postRepository): JsonResponse
    {
        $type = $request->query->get('type');
        $category = $request->query->get('category');
        $city = $request->query->get('city');

        $posts = $postRepository->findByFilters($type, $category, $city);

        $postData = [];
        foreach ($posts as $post) {
            $postData[] = [
                'id' => $post->getId(),
                'type' => $post->getType(),
                'title' => $post->getTitle(),
                'description' => $post->getDescription(),
                'category' => $post->getCategory(),
                'price' => $post->getPrice(),
                'location' => $post->getLocation(),
                'status' => $post->getStatus(),
                'image' => $post->getImage(),
                'owner' => [
                    'id' => $post->getOwner()->getId(),
                    'fullName' => $post->getOwner()->getFullName(),
                    'avatar' => $post->getOwner()->getAvatar(),
                ]
            ];
        }

        return $this->json([
            'message' => 'Posts fetched successfully',
            'data' => $postData
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse
    {
        $userId = $request->headers->get('X-User-Id');
        if (!$userId) {
            return $this->json(['message' => 'Unauthorized. Please log in.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $user = $entityManager->getRepository(\App\Entity\User::class)->find($userId);
        if (!$user) {
            return $this->json(['message' => 'Invalid User ID.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = new Post();
        $post->setType($request->request->get('type', 'OFFER'));
        $post->setTitle($request->request->get('title', ''));
        $post->setDescription($request->request->get('description', ''));
        $post->setCategory($request->request->get('category', ''));
        $post->setPrice($request->request->get('price') ? (float)$request->request->get('price') : null);
        $post->setLocation($request->request->get('location', ''));
        $post->setStatus('ACTIVE');
        $post->setOwner($user);

        // Handle image upload
        $imageFile = $request->files->get('image');
        if ($imageFile) {
            $newFilename = uniqid() . '.' . $imageFile->guessExtension();
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/posts';
            $imageFile->move($uploadDir, $newFilename);
            $post->setImage('/uploads/posts/' . $newFilename);
        }

        $errors = $validator->validate($post);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['message' => 'Validation error', 'errors' => $errorMessages], JsonResponse::HTTP_BAD_REQUEST);
        }

        $entityManager->persist($post);
        $entityManager->flush();

        return $this->json([
            'message' => 'Post created successfully',
            'postId' => $post->getId()
        ], JsonResponse::HTTP_CREATED);
    }
}
