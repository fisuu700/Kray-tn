<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/user', name: 'api_user_')]
class UserController extends AbstractController
{
    #[Route('/profile', name: 'update_profile', methods: ['POST'])]
    public function updateProfile(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $userId = (int) $request->headers->get('X-User-Id');
        if (!$userId) {
            return $this->json(['message' => 'Unauthorized'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $user = $em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $fullName = $request->request->get('fullName');
        if ($fullName) {
            $user->setFullName($fullName);
        }

        // Handle avatar image upload
        $avatarFile = $request->files->get('avatar');
        if ($avatarFile) {
            $newFilename = 'avatar_' . $userId . '_' . uniqid() . '.' . $avatarFile->guessExtension();
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/avatars';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $avatarFile->move($uploadDir, $newFilename);
            $user->setAvatar('/uploads/avatars/' . $newFilename);
        }

        $em->flush();

        return $this->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'fullName' => $user->getFullName(),
                'email' => $user->getEmail(),
                'avatar' => $user->getAvatar(),
            ]
        ]);
    }
}
